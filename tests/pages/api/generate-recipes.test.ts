/**
 * @jest-environment node
 */
import generateRecipes from '../../../src/pages/api/generate-recipes';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';
import * as op from '../../../src/lib/openai';

// mock authOptions 
jest.mock("../../../src/pages/api/auth/[...nextauth]", () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));
//use to mock nextauth getserversession
jest.mock("next-auth/next");
//use to mock utility that calls openai
jest.mock("../../../src/lib/openai", () => ({
    generateRecipe: jest.fn()
}))

describe('Generating recipes', () => {
    let getServerSessionSpy: any
    let generateRecipeSpy: any

    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
        generateRecipeSpy = jest.spyOn(op, 'generateRecipe')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('shall reject requests that do not use the POST method', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('GET')
        await generateRecipes(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Method GET Not Allowed' }))
        expect(res._getHeaders()).toEqual({ allow: ['POST'], "content-type": "application/json" })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('POST')
        await generateRecipes(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
    })

    it('shall reject requests if no ingredients are submitted', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('POST')
        const updatedreq = {
            ...req,
            body: {
                ingredients: []
            }
        }
        await generateRecipes(updatedreq as any, res)
        expect(res.statusCode).toBe(400)
        expect(res._getJSONData()).toEqual({ error: 'Ingredients are required' })
    })

    it('shall return the generated recipes', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        generateRecipeSpy.mockImplementationOnce(() => Promise.resolve(stubRecipeBatch))
        const { req, res } = mockRequestResponse('POST')
        const updatedreq = {
            ...req,
            body: {
                ingredients: ['ingredient-a', 'ingredeint-b'],
                dietaryPreferences: ['preference-1']
            }
        }
        await generateRecipes(updatedreq as any, res)
        expect(generateRecipeSpy).toHaveBeenCalledWith(['ingredient-a', 'ingredeint-b'], ['preference-1'], '6687d83725254486590fec59')
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch)
    })


    it('will respond with error if POST is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        generateRecipeSpy.mockRejectedValueOnce('Error')

        const { req, res } = mockRequestResponse('POST')
        const updatedreq = {
            ...req,
            body: {
                ingredients: ['ingredient-a', 'ingredeint-b']
            }
        }
        await generateRecipes(updatedreq as any, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to generate recipes' })
    })
});