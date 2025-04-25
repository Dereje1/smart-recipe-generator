/**
 * @jest-environment node
 */
import handler from '../../../src/pages/api/chat-assistant';
import { mockRequestResponse } from '../../apiMocks';
import Recipe from '../../../src/models/recipe';
import aigenerated from '../../../src/models/aigenerated';
import * as nextAuth from 'next-auth';
import * as op from '../../../src/lib/openai';
import { stub_recipe_1, getServerSessionStub } from '../../stub';

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

jest.mock('../../../src/lib/mongodb', () => ({
    connectDB: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../../src/lib/openai', () => ({
    generateChatResponse: jest.fn(),
}));

describe('/api/chat-assistant endpoint', () => {
    let getServerSessionSpy: any
    let generateChatResponseSpy: any
    beforeEach(() => {
        // Set environment variables
        process.env = {
            ...process.env,
            API_REQUEST_LIMIT: '5',
        };
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
        generateChatResponseSpy = jest.spyOn(op, 'generateChatResponse')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('shall return 400 if inputs are missing', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('POST')
        await handler(req, res);
        expect(res._getStatusCode()).toBe(400);
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Message and recipeId are required.' }));
    });

    it('shall return 404 if recipe not found', async () => {
        aigenerated.countDocuments = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(4)
            }),
        );
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                lean: jest.fn().mockResolvedValueOnce(null),
            }),
        );

        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                message: 'test',
                recipeId: 'nonexistent',
            }
        }

        await handler(updatedreq, res);
        expect(res._getStatusCode()).toBe(404);
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Recipe not found.' }));
    });

    it('shall respond with limt reached if user has exceeded their api usage', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        generateChatResponseSpy.mockImplementationOnce(() => Promise.resolve({ reply: 'mock-ai-reply', totalTokens: 1000 }))
        aigenerated.countDocuments = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(6)
            }),
        );
        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                lean: jest.fn().mockResolvedValueOnce(stub_recipe_1),
            }),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                message: 'test',
                recipeId: '123',
                history: ['first message'],
            }
        }
        await handler(updatedreq, res);
        expect(res._getStatusCode()).toBe(200);
        expect(res._getData()).toEqual(JSON.stringify({ reachedLimit: true}));
    });

    it('shall respond with assistant reply if everything succeeds', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        generateChatResponseSpy.mockImplementationOnce(() => Promise.resolve({ reply: 'mock-ai-reply', totalTokens: 1000 }))
        aigenerated.countDocuments = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(4)
            }),
        );
        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                lean: jest.fn().mockResolvedValueOnce(stub_recipe_1),
            }),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                message: 'test',
                recipeId: '123',
                history: [],
            }
        }
        await handler(updatedreq, res);
        expect(res._getStatusCode()).toBe(200);
        expect(res._getData()).toEqual(JSON.stringify({ reply: 'mock-ai-reply', totalTokens: 1000 }));
    });

    it('shall handle internal server error gracefully', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                lean: jest.fn().mockRejectedValueOnce(null),
            }),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                message: 'test',
                recipeId: 'nonexistent',
            }
        }
        await handler(updatedreq, res);
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Internal server error' }));
    });
});
