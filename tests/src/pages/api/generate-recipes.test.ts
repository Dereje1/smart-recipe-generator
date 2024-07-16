/**
 * @jest-environment node
 */
import generateRecipes from '../../../../src/pages/api/generate-recipes';
import { mockRequestResponse } from '../../../apiMocks';
import { stubRecipeBatch } from '../../../stub';
import { getServerSession } from 'next-auth';
import * as op from '../../../../src/lib/openai';

// mock authOptions 
jest.mock("../../../../src/pages/api/auth/[...nextauth]", () => ({
    authOptions: {
        adapter: {},
        providers: [],
        callbacks: {},
    },
}));
//use to mock gets session
jest.mock("next-auth/next");

jest.mock("../../../../src/lib/openai", () => ({
    generateRecipe: jest.fn(() => Promise.resolve(stubRecipeBatch))
}))

describe('Generating recipes', () => {
    it('shall not proceed if user is not logged in', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('POST')
        await generateRecipes(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ message: 'You must be logged in.' })
    })

    it('shall return the generated recipes', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const { req, res } = mockRequestResponse('POST')
        const updatedreq = {
            ...req,
            body: {
                ingredients: ['ingredient-a', 'ingredeint-b']
            }
        }
        await generateRecipes(updatedreq as any, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch)
    })

    it('shall reject requests if no ingredients are submitted', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
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
    it('will respond with error if GET is rejected', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))


        const generateRecipeSpy = jest.spyOn(op, 'generateRecipe')
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

    it('shall reject requests that do not use the POST method', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const { req, res } = mockRequestResponse('GET')
        await generateRecipes(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual('Method GET Not Allowed')
        expect(res._getHeaders()).toEqual({ allow: ['POST'] })
    })
});