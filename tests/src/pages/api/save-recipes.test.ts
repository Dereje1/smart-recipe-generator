/**
 * @jest-environment node
 */
import saveRecipes from '../../../../src/pages/api/save-recipes';
import Recipe from '../../../../src/lib/models/recipe';
import { mockRequestResponse } from '../../../apiMocks';
import { getServerSession } from 'next-auth';
import { stubRecipeBatch } from '../../../stub';

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
    generateImages: jest.fn(() => Promise.resolve([
        {
            imgLink: 'https://mock-openai-imglink-1'
        },
        {
            imgLink: 'https://mock-openai-imglink-2'
        }
    ]))
}))

// mocks aws upload
jest.mock('../../../../src/lib/awss3', () => ({
    uploadImagesToS3: jest.fn(() => Promise.resolve([
        {
            location: '6683b8908475eac9af5fe834',
            uploaded: true
        },
        {
            location: '6683b8908475eac9af5fe836',
            uploaded: false
        }
    ]))
}))

describe('Saving recipes', () => {
    it('shall not proceed if user is not logged in', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('POST')
        await saveRecipes(req, res)
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
        await saveRecipes(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual('Method GET Not Allowed')
        expect(res._getHeaders()).toEqual({ allow: ['POST'] })
    })

    it('shall succesfully generate images and save recipes', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
        Recipe.insertMany = jest.fn().mockImplementation(
            () => Promise.resolve(),
        );
        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                recipes: stubRecipeBatch
            }
        }
        await saveRecipes(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual({ status: 'Saved Recipes and generated the Images!' })
    })

    it('will respond with error if POST call is rejected', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        Recipe.insertMany = jest.fn().mockImplementation(
            () => Promise.reject(),
        );

        const { req, res } = mockRequestResponse('POST')
        const updatedreq: any = {
            ...req,
            body: {
                ingredientName: 'mockIngredient'
            }
        }
        await saveRecipes(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to save recipes' })
    })
});