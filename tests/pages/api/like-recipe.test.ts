/**
 * @jest-environment node
 */
import likeRecipe from '../../../src/pages/api/like-recipe';
import mongoose from 'mongoose';
import Recipe from '../../../src/models/recipe';
import Notification from '../../../src/models/notification';
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

// Mock Recipe schema
jest.mock('../../../src/models/recipe', () => ({
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
}));

// Mock Notification schema
jest.mock('../../../src/models/notification', () => ({
    findOneAndUpdate: jest.fn(),
}));

describe('Liking a recipe', () => {
    let getServerSessionSpy: any
    beforeEach(() => {
        getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    })

    afterEach(() => {
        jest.resetAllMocks()
    })
    it('shall reject requests that do not use the PUT method', async () => {
        const { req, res } = mockRequestResponse('GET')
        await likeRecipe(req, res)
        expect(res.statusCode).toBe(405)
        expect(res._getJSONData()).toEqual({ error: 'Method GET Not Allowed' })
        expect(res._getHeaders()).toEqual({ allow: ['PUT'], "content-type": "application/json" })
    })

    it('shall not proceed if user is not logged in', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
        const { req, res } = mockRequestResponse('PUT')
        await likeRecipe(req, res)
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

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 'invalid-recipe-id'
            }
        }
        await likeRecipe(updatedreq, res)
        expect(res._getJSONData()).toEqual({ error: "Invalid recipe ID" })
    })

    it('shall reject request if the recipe id is not found', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockResolvedValue(undefined),
            }),
        );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 1234
            }
        }
        await likeRecipe(updatedreq, res)
        expect(res._getData()).toEqual('Recipe with Id: 1234 not found... exiting')
    })

    it('shall like a  recipe if not already liked', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

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

        Notification.findOneAndUpdate = jest.fn().mockResolvedValue({}); // Mock Notification.findOneAndUpdate

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 1234
            }
        }
        await likeRecipe(updatedreq, res)
        expect(Recipe.findByIdAndUpdate).toHaveBeenCalledWith(
            1234,
            { $addToSet: { likedBy: new mongoose.Types.ObjectId('6687d83725254486590fec59') } },
            { "new": true }
        )
        expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
            {
                userId: stubRecipeBatch[0].owner,
                initiatorId: '6687d83725254486590fec59',
                type: 'like',
                recipeId: 1234,
            },
            {
                $setOnInsert: {
                    message: `${getServerSessionStub.user.name} liked your recipe: "${stubRecipeBatch[0].name}"`,
                    read: false
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch[0])
    })

    it('shall unlike a recipe if already liked but not send a notification', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
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

        Notification.create = jest.fn().mockResolvedValue({}); // Mock Notification.create

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 1234
            }
        }
        await likeRecipe(updatedreq, res)
        expect(Recipe.findByIdAndUpdate).toHaveBeenCalledWith(
            1234,
            { $pull: { likedBy: new mongoose.Types.ObjectId('6687d83725254486590fec59') } },
            { "new": true }
        )
        expect(Notification.create).toHaveBeenCalledTimes(0)
        expect(res.statusCode).toBe(200)
        expect(res._getJSONData()).toEqual(stubRecipeBatch[0])
    })

    it('shall interupt the process if new document is not returned', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
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
                recipeId: 1234
            }
        }
        await likeRecipe(updatedreq, res)
        expect(Recipe.findByIdAndUpdate).toHaveBeenCalledWith(
            1234,
            { $pull: { likedBy: new mongoose.Types.ObjectId('6687d83725254486590fec59') } },
            { "new": true }
        )
        expect(res._getData()).toEqual('Recipe with Id: 1234 unable to return document.. exiting')
    })

    it('will respond with error if PUT call is rejected', async () => {
        getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

        Recipe.findById = jest.fn().mockImplementation(
            () => ({
                exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
            }),
        );

        const { req, res } = mockRequestResponse('PUT')
        const updatedreq: any = {
            ...req,
            body: {
                recipeId: 1234
            }
        }
        await likeRecipe(updatedreq, res)
        expect(res.statusCode).toBe(500)
        expect(res._getJSONData()).toEqual({ error: 'Failed to like recipe' })
    })
});