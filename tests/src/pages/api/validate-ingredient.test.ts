/**
 * @jest-environment node
 */
import validateIngredient from '../../../../src/pages/api/validate-ingredient';
import Ingredient from '../../../../src/lib/models/ingredient';
import { mockRequestResponse } from '../../../apiMocks';
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


// mock db connection
jest.mock('../../../../src/lib/mongodb', () => ({
    connectDB: () => Promise.resolve()
}))

//open ai validation
jest.mock('../../../../src/lib/openai', () => ({
    validateIngredient: jest.fn(() => Promise.resolve(null))
}))

describe('Liking a recipe', () => {
    it('shall not proceed if user is not logged in', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('POST')
        await validateIngredient(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ message: 'You must be logged in.' })
    })

    it('shall reject requests that do not use the POST method', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const { req, res } = mockRequestResponse('GET')
        await validateIngredient(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual('Method GET Not Allowed')
        expect(res._getHeaders()).toEqual({ allow: ['POST'] })
    })

    it('shall reject request if no ingredient name provided', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {}
        }
        await validateIngredient(updatedreq, res)
        expect(res.statusCode).toBe(400)
        expect(res._getJSONData()).toEqual({ message: 'Ingredient name is required' })
    })

    it('shall respond with error message if openai fails to validate request', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                ingredientName: 'mockIngredient'
            }
        }
        await validateIngredient(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({ message: 'Error with parsing response' })
    })

    it('shall appropriately respond for an invalid ingredient name ', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
        // change open ai result
        const validateIngredientSpy = jest.spyOn(op, 'validateIngredient');
        validateIngredientSpy.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
            isValid: false,
            possibleVariations: ['var-1', 'var-2']
        })))
        // mock db find query
        Ingredient.findOne = jest.fn().mockImplementation(
            () => Promise.resolve([]),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                ingredientName: 'mockIngredient'
            }
        }
        await validateIngredient(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({ message: 'Invalid', suggested: ['var-1', 'var-2'] })
    })

    it('shall appropriately respond for an ingredient that already exists in the db', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
        // change open ai result
        const validateIngredientSpy = jest.spyOn(op, 'validateIngredient');
        validateIngredientSpy.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
            isValid: true,
            possibleVariations: ['var-1', 'var-2']
        })))
        // mock db find query
        Ingredient.findOne = jest.fn().mockImplementation(
            () => Promise.resolve(true),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                ingredientName: 'mockIngredient'
            }
        }
        await validateIngredient(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({ message: 'Error: This ingredient already exists' })
    })

    it('shall add the requested ingredient if valid and does not exist in the db', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
        // change open ai result
        const validateIngredientSpy = jest.spyOn(op, 'validateIngredient');
        validateIngredientSpy.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
            isValid: true,
            possibleVariations: ['var-1', 'var-2']
        })))
        // mock db find query
        Ingredient.findOne = jest.fn().mockImplementation(
            () => Promise.resolve(false),
        );
        // mock db create query
        Ingredient.create = jest.fn().mockImplementation(
            () => Promise.resolve('mock-added-ingredient'),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                ingredientName: 'mockIngredient'
            }
        }
        await validateIngredient(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({ message: 'Success', newIngredient: 'mock-added-ingredient' })
    })

    it('will respond with error if POST call is rejected', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const validateIngredientSpy = jest.spyOn(op, 'validateIngredient');
        validateIngredientSpy.mockRejectedValueOnce(() => Promise.reject())

        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                ingredientName: 'mockIngredient'
            }
        }
        await validateIngredient(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ message: 'Failed to add ingredient' })
    })
});