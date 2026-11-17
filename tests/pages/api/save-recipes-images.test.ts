/**
 * @jest-environment node
 */
import nock from 'nock';
import mongoose from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import { getServerSession } from 'next-auth/next';
import saveRecipes from '../../../src/pages/api/save-recipes';
import * as openai from '../../../src/lib/openai';
import aiGenerated from '../../../src/models/aigenerated';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';

// Exercise the installed SDK's real HTTP serialization without credentials or retries.
jest.mock('openai', () => {
    const OpenAI = jest.requireActual('openai').default;
    return jest.fn(() => new OpenAI({ apiKey: 'test-key', maxRetries: 0 }));
});
jest.mock('../../../src/pages/api/auth/[...nextauth]', () => ({ authOptions: {} }));
jest.mock('next-auth/next');
jest.mock('../../../src/lib/mongodb', () => ({ connectDB: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../../src/lib/openai', () => ({
    ...jest.requireActual('../../../src/lib/openai'),
    // Tagging is outside this image migration; prevent an extra text request.
    generateRecipeTags: jest.fn().mockResolvedValue(undefined),
}));

// A one-pixel PNG: test bytes, never a live generated image.
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7XQAAAAASUVORK5CYII=', 'base64');
const selectedRecipes = stubRecipeBatch.map((recipe, idx) => ({
    ...recipe,
    openaiPromptId: `6683b8908475eac9af5fe834-${idx}`,
}));

describe('Saving recipes with the Images API and S3 buffer pipeline', () => {
    const s3 = mockClient(S3Client);
    const originalEnv = process.env;

    beforeAll(() => nock.disableNetConnect());
    beforeEach(() => {
        process.env = {
            ...originalEnv,
            S3_BUCKET_NAME: 'smart-recipe-generator',
            AWS_ACCESS_KEY_ID: 'test-access-key',
            AWS_SECRET_ACCESS_KEY: 'test-secret-key',
        };
        s3.reset();
        s3.on(PutObjectCommand).resolves({});
        jest.mocked(getServerSession).mockResolvedValue(getServerSessionStub);
        jest.spyOn(aiGenerated, 'create').mockResolvedValue({ _id: 'image-log-id' } as never);
        jest.spyOn(Recipe, 'insertMany').mockResolvedValue([]);
    });
    afterEach(() => {
        process.env = originalEnv;
        nock.cleanAll();
        jest.restoreAllMocks();
    });
    afterAll(() => {
        s3.restore();
        nock.enableNetConnect();
    });

    it('posts supported image parameters, uploads PNG bytes under existing keys, and persists S3 URLs', async () => {
        const api = nock('https://api.openai.com')
            .post('/v1/images/generations', body => {
                expect(body).toEqual({
                    model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-flare',
                    prompt: expect.any(String),
                    n: 1,
                    size: '1024x1024',
                    output_format: 'png',
                });
                return true;
            })
            .times(selectedRecipes.length)
            .reply(200, { created: 1794916800, data: [{ b64_json: png.toString('base64') }] });
        jest.mocked(Recipe.insertMany).mockResolvedValue(stubRecipeBatch as never);
        const { req, res } = mockRequestResponse('POST');
        req.body = { recipes: selectedRecipes };

        await saveRecipes(req, res);

        expect(api.isDone()).toBe(true);
        const uploads = s3.commandCalls(PutObjectCommand);
        expect(uploads).toHaveLength(selectedRecipes.length);
        uploads.forEach((call, idx) => {
            expect(call.args[0].input).toEqual({
                Bucket: 'smart-recipe-generator',
                Key: selectedRecipes[idx].openaiPromptId,
                Body: png,
                ContentType: 'image/png',
                Tagging: `userId=${getServerSessionStub.user.id}`,
                CacheControl: 'public, max-age=2592000',
            });
        });
        expect(Recipe.insertMany).toHaveBeenCalledWith(selectedRecipes.map(recipe => ({
            ...recipe,
            owner: new mongoose.Types.ObjectId(getServerSessionStub.user.id),
            imgLink: `https://smart-recipe-generator.s3.amazonaws.com/${recipe.openaiPromptId}`,
            openaiPromptId: recipe.openaiPromptId.split('-')[0],
        })));
        expect(aiGenerated.create).toHaveBeenCalledWith(expect.objectContaining({
            model: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.5-flare',
            response: selectedRecipes.map(() => ({ created: 1794916800, hasUrl: false, hasB64Json: true })),
        }));
        expect(openai.generateRecipeTags).toHaveBeenCalledTimes(selectedRecipes.length);
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({ status: 'Saved Recipes and generated the Images!' });
    });

    it.each([
        [400, { error: { message: "The model 'gpt-image-1' does not exist.", type: 'invalid_request_error' } }],
        [200, { created: 1794916800, data: [{}] }],
        [200, { created: 1794916800, data: [] }],
    ])('returns the existing save error without uploads or recipe inserts for image failure (%s)', async (status, body) => {
        const api = nock('https://api.openai.com')
            .post('/v1/images/generations')
            .reply(status, body);
        const { req, res } = mockRequestResponse('POST');
        req.body = { recipes: selectedRecipes.slice(0, 1) };

        await saveRecipes(req, res);

        expect(api.isDone()).toBe(true);
        expect(s3.commandCalls(PutObjectCommand)).toHaveLength(0);
        expect(Recipe.insertMany).not.toHaveBeenCalled();
        expect(openai.generateRecipeTags).not.toHaveBeenCalled();
        expect(res.statusCode).toBe(500);
        expect(res._getJSONData()).toEqual({ error: 'Failed to save recipes' });
    });
});
