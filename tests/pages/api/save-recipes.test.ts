/**
 * @jest-environment node
 */
import saveRecipes from '../../../src/pages/api/save-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';
import * as openai from '../../../src/lib/openai';

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

//open ai validation
jest.mock('../../../src/lib/openai', () => ({
    generateImages: jest.fn(),
    generateRecipeTags: () => Promise.resolve()
}))

// mocks aws upload
jest.mock('../../../src/lib/awss3', () => ({
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
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('shall reject requests that do not use the POST method', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('GET')
        await saveRecipes(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Method GET Not Allowed' }))
        expect(res._getHeaders()).toEqual({ allow: ['POST'], 'content-type': 'application/json' })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('POST')
        await saveRecipes(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
    })

    it('shall succesfully generate images and save recipes', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const generateImagesSpy = jest.spyOn(openai, 'generateImages')
        generateImagesSpy.mockImplementationOnce(() => Promise.resolve([
            {
                imgLink: 'https://mock-openai-imglink-1',
                name: 'recipe-1'
            },
            {
                imgLink: 'https://mock-openai-imglink-2',
                name: 'recipe-2'
            }
        ]))

        Recipe.insertMany = jest.fn().mockImplementation(
            () => Promise.resolve(stubRecipeBatch),
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
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

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