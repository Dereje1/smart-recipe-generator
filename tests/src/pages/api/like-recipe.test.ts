/**
 * @jest-environment node
 */
import likeRecipe from '../../../../src/pages/api/like-recipe';
import mongoose from 'mongoose';
import Recipe from '../../../../src/lib/models/recipe';
import { mockRequestResponse } from '../../../apiMocks';
import { stubRecipeBatch } from '../../../stub';
import { getServerSession } from 'next-auth';

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

describe('Liking a recipe', () => {
    it('shall not proceed if user is not logged in', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('POST')
        await likeRecipe(req, res)
        expect(res.statusCode).toBe(401)
        expect(res._getJSONData()).toEqual({ message: 'You must be logged in.' })
    })

    it('shall reject requests that do not use the PUT method', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        const { req, res } = mockRequestResponse('GET')
        await likeRecipe(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getData()).toEqual('Method GET Not Allowed')
        expect(res._getHeaders()).toEqual({ allow: ['PUT'] })
    })

    it('shall reject request if the recipe id is not found', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(undefined),
            }),
        );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'mock_recipe_id'
            }
        }
        await likeRecipe(updatedreq, res)
        expect(res._getData()).toEqual('Recipe with Id: mock_recipe_id not found... exiting')
    })

    it('shall like a  recipe if not already liked', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(stubRecipeBatch[0]),
            }),
        );

        Recipe.findByIdAndUpdate = jest.fn().mockImplementation(
            () => ({
              populate: jest.fn().mockImplementation(() => ({
                lean: jest.fn().mockImplementation(() => ({
                  exec: jest.fn().mockResolvedValue(stubRecipeBatch[0]),
                }))
              })),
            }),
          );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'mock_recipe_id'
            }
        }
        await likeRecipe(updatedreq, res)
        expect(Recipe.findByIdAndUpdate).toHaveBeenCalledWith(
            "mock_recipe_id", 
            {"$set": {"likedBy": [{"_id": "668550b989b50bfdbcc56198", "image": "https://user2.img.link", "name": "user_2"}, new mongoose.Types.ObjectId("6687d83725254486590fec59")]}}, 
            {"new": true}
        )
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch[0])
    })

    it('shall unlike a  recipe if already liked', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
        // update stub to indicate the recipe has already been liked by current user
        const updatedRecipe = {
            ...stubRecipeBatch[0],
            likedBy: [new mongoose.Types.ObjectId('6687d83725254486590fec59')]
        }

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(updatedRecipe),
            }),
        );

        Recipe.findByIdAndUpdate = jest.fn().mockImplementation(
            () => ({
              populate: jest.fn().mockImplementation(() => ({
                lean: jest.fn().mockImplementation(() => ({
                  exec: jest.fn().mockResolvedValue(stubRecipeBatch[0]),
                }))
              })),
            }),
          );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'mock_recipe_id'
            }
        }
        await likeRecipe(updatedreq, res)
        expect(Recipe.findByIdAndUpdate).toHaveBeenCalledWith(
            "mock_recipe_id", 
            {"$set": {"likedBy": []}}, 
            {"new": true}
        )
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch[0])
    })

    it('shall interupt....', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))
        // update stub to indicate the recipe has already been liked by current user
        const updatedRecipe = {
            ...stubRecipeBatch[0],
            likedBy: [new mongoose.Types.ObjectId('6687d83725254486590fec59')]
        }

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(updatedRecipe),
            }),
        );

        Recipe.findByIdAndUpdate = jest.fn().mockImplementation(
            () => ({
              populate: jest.fn().mockImplementation(() => ({
                lean: jest.fn().mockImplementation(() => ({
                  exec: jest.fn().mockResolvedValue(undefined),
                }))
              })),
            }),
          );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'mock_recipe_id'
            }
        }
        await likeRecipe(updatedreq, res)
        expect(Recipe.findByIdAndUpdate).toHaveBeenCalledWith(
            "mock_recipe_id", 
            {"$set": {"likedBy": []}}, 
            {"new": true}
        )
        expect(res._getData()).toEqual('Recipe with Id: mock_recipe_id unable to return document.. exiting')
    })

    it('will respond with error if PUT call is rejected', async () => {
        (getServerSession as jest.Mock).mockImplementationOnce(() => Promise.resolve({
            user: {
                id: '6687d83725254486590fec59'
            },
            expires: 'some time'
        }))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
            }),
        );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'mock_recipe_id'
            }
        }
        await likeRecipe(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to like recipe' })
    })
});