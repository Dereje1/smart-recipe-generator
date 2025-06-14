/**
 * @jest-environment node
 */
import deleteRecipe from '../../../src/pages/api/delete-recipe';
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

describe('Deleting a recipe', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('shall reject requests that do not use the DELETE method', async () => {
        const { req, res } = mockRequestResponse('GET')
        await deleteRecipe(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getJSONData()).toEqual({ error: 'Method GET Not Allowed' })
        expect(res._getHeaders()).toEqual({ allow: ['DELETE'], "content-type": "application/json" })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('DELETE')
        await deleteRecipe(req, res)
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

        const { req, res } = mockRequestResponse('DELETE')
        const updatedreq: any = {
            ...req,
            query: { recipeId: 'invalid-recipe-id' }
        }
        await deleteRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ error: 'Invalid recipe ID.' })
    })

    it('shall reject request if the recipe id is not found', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(undefined),
            }),
        );

        const { req, res } = mockRequestResponse('DELETE')
        const updatedreq: any = {
            ...req,
            query: { recipeId: '648863e41f4500b3d9a3c1a9' }
        }
        await deleteRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ error: 'Recipe with ID: 648863e41f4500b3d9a3c1a9 not found.' })
    })

    it('shall reject request if the recipe is not owned by the user', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(stubRecipeBatch[1]),
            }),
        );

        const { req, res } = mockRequestResponse('DELETE')
        const updatedreq: any = {
            ...req,
            query: { recipeId: '648863e41f4500b3d9a3c1a9' }
        }
        await deleteRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ error: 'You do not have permission to delete this recipe.' })
    })


    it('shall delete a recipe', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue({
                    ...stubRecipeBatch[0],
                    owner: '6687d83725254486590fec59'
                }),
            }),
        );

        Recipe.findByIdAndDelete = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(''),
            }),
        );

        const { req, res } = mockRequestResponse('DELETE')
        const updatedreq: any = {
            ...req,
            query: { recipeId: '648863e41f4500b3d9a3c1a9' }
        }
        await deleteRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ message: 'Deleted recipe with ID 648863e41f4500b3d9a3c1a9' })
    })

    it('will respond with error if DELETE call is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
            }),
        );

        const { req, res } = mockRequestResponse('DELETE')
        const updatedreq: any = {
            ...req,
            query: { recipeId: '648863e41f4500b3d9a3c1a9' }
        }
        await deleteRecipe(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to delete recipe' })
    })
});