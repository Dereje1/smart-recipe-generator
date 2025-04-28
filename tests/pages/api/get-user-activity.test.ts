/**
 * @jest-environment node
 */
import getUserActivity from '../../../src/pages/api/get-user-activity';
import Recipe from '../../../src/models/recipe';
import User from '../../../src/models/user';
import { mockRequestResponse } from '../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../stub';
import * as nextAuth from 'next-auth';

// Mock authOptions
jest.mock("../../../src/pages/api/auth/[...nextauth]", () => ({
  authOptions: {
    adapter: {},
    providers: [],
    callbacks: {},
  },
}));

// Mock next-auth
jest.mock("next-auth/next");

// Mock db connection
jest.mock('../../../src/lib/mongodb', () => ({
  connectDB: () => Promise.resolve()
}));

describe('Fetching user activity (created and liked recipes)', () => {
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
    await getUserActivity(req, res)
    expect(res.statusCode).toBe(405)
    expect(res._getData()).toEqual(JSON.stringify({ error: 'Method POST Not Allowed' }))
    expect(res._getHeaders()).toEqual({ allow: ['GET'], 'content-type': 'application/json' })
  })

  it('shall not proceed if user is not logged in', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
    const { req, res } = mockRequestResponse()
    await getUserActivity(req, res)
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
  })

  it('shall reject if userId is missing or invalid', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub));
    const { req, res } = mockRequestResponse()
    // No userId
    await getUserActivity(req, res)
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ error: 'Invalid user ID' })
  })
  
  it('shall return 404 if user not found', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub));
    
    User.findById = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue(null) // Simulate user not found
      })),
    }));
  
    const { req, res } = mockRequestResponse()
    req.query.userId = '507f1f77bcf86cd799439011';
  
    await getUserActivity(req, res)
    expect(res.statusCode).toBe(404)
    expect(res._getJSONData()).toEqual({ error: 'User not found' })
  })
  
  it('shall return the user info and recipes', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    
    User.findById = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockResolvedValue({
          name: 'John Doe',
          image: 'https://example.com/avatar.jpg'
        }),
      })),
    }));

    Recipe.find = jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockImplementation(() => ({
        sort: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockResolvedValue(stubRecipeBatch)
        }))
      }))
    }));

    const { req, res } = mockRequestResponse()
    req.query.userId = '507f1f77bcf86cd799439011'; // valid dummy ObjectId

    await getUserActivity(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toMatchObject({
      user: {
        name: 'John Doe',
        image: 'https://example.com/avatar.jpg',
      },
      createdRecipes: stubRecipeBatch,
      likedRecipes: stubRecipeBatch
    })
  })

  it('will respond with internal server error if fetching fails', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))

    User.findById = jest.fn().mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        lean: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
      })),
    }));

    const { req, res } = mockRequestResponse()
    req.query.userId = '507f1f77bcf86cd799439011';

    await getUserActivity(req, res)
    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Internal server error' })
  })

});
