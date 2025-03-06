/**
 * @jest-environment node
 */
import getSingleRecipe from '../../../src/pages/api/get-single-recipe';
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

describe('Retrieving a single recipe', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('shall reject requests that do not use the GET method', async () => {
        const { req, res } = mockRequestResponse('PUT')
        await getSingleRecipe(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getJSONData()).toEqual({ error: 'Method PUT Not Allowed' })
        expect(res._getHeaders()).toEqual({ allow: ['GET'], "content-type": "application/json" })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('GET')
        await getSingleRecipe(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
    })

    it('shall reject request if the recipe id submitted is invalid', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(undefined),
            }),
        );

        const { req, res } = mockRequestResponse('GET')
        const updatedreq: any = {
            ...req,
            query: {
                recipeId: 'invalid-recipe-id'
            },
        }
        await getSingleRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ error: "Invalid recipe ID" })
    })

    it('shall reject request if the recipe id is not found', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                populate: jest.fn().mockImplementation(() => ({
                    lean: jest.fn().mockImplementation(() => ({
                        exec: jest.fn().mockResolvedValue(undefined),
                    }))
                })),
            }),
        );

        const { req, res } = mockRequestResponse('GET')
        const updatedreq: any = {
            ...req,
            query: {
                recipeId: '668cee5451bc971a18746fb9'
            },
        }
        await getSingleRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ error: 'Recipe with Id: 668cee5451bc971a18746fb9 not found... exiting' })
    })

    it('shall respond with a valid recipe', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                populate: jest.fn().mockImplementation(() => ({
                    lean: jest.fn().mockImplementation(() => ({
                        exec: jest.fn().mockResolvedValue(stubRecipeBatch[0]),
                    }))
                })),
            }),
        );

        const { req, res } = mockRequestResponse('GET')
        const updatedreq: any = {
            ...req,
            query: {
                recipeId: '668cee5451bc971a18746fb9'
            },
        }
        await getSingleRecipe(updatedreq, res)
        expect(Recipe.findById).toHaveBeenCalledWith('668cee5451bc971a18746fb9')
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch[0])
    })

    it('will respond with error if GET call is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
            }),
        );

        const { req, res } = mockRequestResponse('GET')
        const updatedreq: any = {
            ...req,
            query: {
                recipeId: '668cee5451bc971a18746fb9'
            },
        }
        await getSingleRecipe(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to fetch recipe' })
    })
});