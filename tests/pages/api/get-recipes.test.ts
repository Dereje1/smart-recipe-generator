/**
 * @jest-environment node
 */
import recipes from '../../../src/pages/api/get-recipes';
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

describe('Getting recipes for the home page', () => {
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
    await recipes(req, res)
    expect(res.statusCode).toBe(405)
    expect(res._getData()).toEqual(JSON.stringify({ error: 'Method POST Not Allowed' }))
    expect(res._getHeaders()).toEqual({ allow: ['GET'], 'content-type': 'application/json' })
  })

  it('shall not proceed if user is not logged in', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
    const { req, res } = mockRequestResponse()
    await recipes(req, res)
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
  })

  it('shall return the most popular recipes', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    Recipe.countDocuments = jest.fn().mockImplementation(() => 500);

    // Mock `Recipe.aggregate` for `allRecipes`
    Recipe.aggregate = jest.fn()
      .mockResolvedValueOnce(stubRecipeBatch)  // First call: allRecipes
      .mockResolvedValueOnce(['tag-1', 'tag-2']); // Second call: popularTags

    const { req, res } = mockRequestResponse()
    await recipes(req, res)
    expect(res.statusCode).toBe(200)

    expect(res._getJSONData()).toEqual({
      recipes: stubRecipeBatch,
      totalRecipes: 500,
      totalPages: 42,
      currentPage: 1,
      popularTags: ['tag-1', 'tag-2']
    })
    // for popular lookup
    expect(Recipe.aggregate).toHaveBeenNthCalledWith(1,[
      {
        "$set": {
          "likeCount": {
            "$size": {
              "$ifNull": [
                "$likedBy",
                []
              ]
            }
          }
        }
      },
      {
        "$sort": {
          "likeCount": -1,
          _id: 1
        }
      },
      {
        "$skip": 0
      },
      {
        "$limit": 12
      },
      {
        "$lookup": {
          "as": "owner",
          "foreignField": "_id",
          "from": "users",
          "localField": "owner"
        }
      },
      {
        "$lookup": {
          "as": "likedBy",
          "foreignField": "_id",
          "from": "users",
          "localField": "likedBy"
        }
      },
      {
        "$unwind": "$owner"
      },
      {
        "$lookup": {
          "as": "comments.user",
          "foreignField": "_id",
          "from": "comments",
          "localField": "comments.user"
        }
      }
    ])

    // for popular tags lookup
    expect(Recipe.aggregate).toHaveBeenNthCalledWith(2, [
      { $unwind: "$tags" },
      { $unwind: "$tags.tag" },
      { $group: { _id: "$tags.tag", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])
  })

  it('shall return the most recent recipes', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    Recipe.countDocuments = jest.fn().mockImplementation(() => 500);

    // Mock `Recipe.aggregate` for `allRecipes`
    Recipe.aggregate = jest.fn()
      .mockResolvedValueOnce(stubRecipeBatch)  // First call: allRecipes
      .mockResolvedValueOnce(['tag-1', 'tag-2']); // Second call: popularTags

    const { req, res } = mockRequestResponse()
    const updatedreq: any = {
      ...req,
      query: { sortOption: "recent" }
    }
    await recipes(updatedreq, res)

    expect(res.statusCode).toBe(200)

    expect(res._getJSONData()).toEqual({
      recipes: stubRecipeBatch,
      totalRecipes: 500,
      totalPages: 42,
      currentPage: 1,
      popularTags: ['tag-1', 'tag-2']
    })
    // for recent lookup
    expect(Recipe.aggregate).toHaveBeenNthCalledWith(1, [
      {
        "$sort": {
          "createdAt": -1,
          _id: -1
        }
      },
      {
        "$skip": 0
      },
      {
        "$limit": 12
      },
      {
        "$lookup": {
          "as": "owner",
          "foreignField": "_id",
          "from": "users",
          "localField": "owner"
        }
      },
      {
        "$lookup": {
          "as": "likedBy",
          "foreignField": "_id",
          "from": "users",
          "localField": "likedBy"
        }
      },
      {
        "$unwind": "$owner"
      },
      {
        "$lookup": {
          "as": "comments.user",
          "foreignField": "_id",
          "from": "comments",
          "localField": "comments.user"
        }
      }
    ])
    // for popular tags lookup
    expect(Recipe.aggregate).toHaveBeenNthCalledWith(2, [
      { $unwind: "$tags" },
      { $unwind: "$tags.tag" },
      { $group: { _id: "$tags.tag", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])
  })

  it('will respond with error if GET is rejected', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    Recipe.countDocuments = jest.fn().mockImplementation(
      () => jest.fn().mockRejectedValue(new Error('Mocked rejection'))
    );
    const { req, res } = mockRequestResponse()
    await recipes(req, res)
    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch recipes' })
  })

});