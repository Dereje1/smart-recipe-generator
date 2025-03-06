/**
 * @jest-environment node
 */
import tts from '../../../src/pages/api/tts';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

// mock authOptions 
jest.mock("../../../src/pages/api/auth/[...nextauth]", () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));
//use to mock gets session
jest.mock("next-auth/next");
// mock db connection
jest.mock('../../../src/lib/mongodb', () => ({
    connectDB: () => Promise.resolve()
}))

//use to mock utility that calls openai
jest.mock("../../../src/lib/openai", () => ({
    getTTS: jest.fn()
}))

// mocks aws upload
jest.mock('../../../src/lib/awss3', () => ({
    uploadAudioToS3: jest.fn(() => Promise.resolve('mock-audio-link'))
}))

describe('Converting Text To Speech', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        jest.resetModules(); // Clear the module cache
        jest.clearAllMocks(); // Clear all mock states
        // Spy on next-auth's `getServerSession`
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession');
        process.env = {
            ...process.env,
            GOOGLE_SERVICE_KEY_BASE64: Buffer.from(
                JSON.stringify({ key: 'mock-key', other: 'mock-value' })
            ).toString('base64'),
        };
    })

    afterEach(() => {
        jest.resetModules(); // Clear the module cache
        jest.clearAllMocks(); // Clear all mock states
    })

    it('shall return with error if recipe id is not sent', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('POST')
        await tts(req, res)
        expect(res.statusCode).toBe(400)
        expect(res._getJSONData()).toEqual({ "message": "Missing recipeId" })
    })
    it('shall return with error if recipe id is not sent', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.findById = jest.fn().mockImplementation(() => undefined);
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'stub_recipe_id',
            }
        }
        await tts(updatedreq, res)
        expect(res.statusCode).toBe(404)
        expect(res._getJSONData()).toEqual({ "message": "Recipe not found" })
    })

    it('shall return with the audio link if it exists', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.findById = jest.fn().mockImplementation(() => ({ audio: 'stub-audio-link' }));
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'stub_recipe_id',
            }
        }
        await tts(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({ audio: 'stub-audio-link' })
    })

    it('shall convert text to speech and upload to s3', async () => {
        // Mock session and database
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub));
        Recipe.findById = jest.fn().mockImplementation(() => ({
            save: jest.fn().mockResolvedValue(true), // Mock save method
            toObject: jest.fn()
        }));
        // Mock request and response
        const { req, res } = mockRequestResponse('POST');
        const updatedReq: any = {
            ...req,
            body: {
                recipeId: 'stub_recipe_id',
            },
        };

        // Call the handler
        await tts(updatedReq, res);

        // Assertions
        expect(res.statusCode).toBe(200);
        expect(res._getJSONData()).toEqual({ audio: 'mock-audio-link' });
    });

    it('will respond with error if POST is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.findById = jest.fn().mockImplementation(
            () => Promise.reject(),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedReq: any = {
            ...req,
            body: {
                recipeId: 'stub_recipe_id',
                text: 'stub_text_to_convert',
            },
        };

        // Call the handler
        await tts(updatedReq, res);
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ message: 'Error generating or uploading audio' })
    })

});