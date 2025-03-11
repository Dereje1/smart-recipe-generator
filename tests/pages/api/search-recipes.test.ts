/**
 * @jest-environment node
 */
import searchRecipes from '../../../src/pages/api/search-recipes';
import Recipe from '../../../src/models/recipe';
import { mockRequestResponse } from '../../apiMocks';
import { getServerSessionStub, stub_recipe_1 } from '../../stub';
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

describe('Searching recipes', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('shall reject requests that do not use the GET method', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse('POST')
        await searchRecipes(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual(JSON.stringify({ error: 'Method POST Not Allowed' }))
        expect(res._getHeaders()).toEqual({ allow: ['GET'], 'content-type': 'application/json' })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse()
        await searchRecipes(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
    })

    it('shall not proceed if no query was sent', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        const { req, res } = mockRequestResponse()
        await searchRecipes(req, res)
        expect(res.statusCode).toBe(400)
        expect(res._getJSONData()).toEqual({ error: "Search query (tag) is required" })
    })

    it('shall return the search results', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.find = jest.fn().mockImplementation(
            () => ({
                populate: jest.fn().mockImplementation(() => ({
                    skip: jest.fn().mockImplementation(() => ({
                        limit: jest.fn().mockImplementation(() => ({
                            lean: jest.fn().mockResolvedValue([stub_recipe_1]),
                        }))
                    })),
                })),
            }),
        );
        // Mock `Recipe.aggregate` for `allRecipes`
        Recipe.aggregate = jest.fn()
            .mockResolvedValueOnce(['tag-1', 'tag-2']); // popularTags

        Recipe.countDocuments = jest.fn().mockImplementation(() => 50);
        const { req, res } = mockRequestResponse()
        const updatedreq: any = {
            ...req,
            query: { query: "stub-search-query" }
        }
        await searchRecipes(updatedreq, res)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(        {
            recipes: [stub_recipe_1],
            totalRecipes: 50,
            totalPages: 5,
            currentPage: 1,
            popularTags: ["tag-1", "tag-2"], // Now consistent across all requests!
        })

    })
    it('will respond with error if GET is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
        Recipe.find = jest.fn().mockImplementation(
            () => ({
                populate: jest.fn().mockImplementation(() => ({
                    limit: jest.fn().mockImplementation(() => ({
                        lean: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
                    }))
                })),
            }),
        );
        const { req, res } = mockRequestResponse()
        const updatedreq: any = {
            ...req,
            query: { query: "stub-search-query" }
        }
        await searchRecipes(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to fetch search results' })
    })

});