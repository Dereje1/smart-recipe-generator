/**
 * @jest-environment node
 */
import profile from '../../../src/pages/api/profile';
import Recipe from '../../../src/models/recipe';
import aigenerated from '../../../src/models/aigenerated';
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

describe('Getting recipes for the profile page', () => {
  let getServerSessionSpy: any
  beforeEach(() => {
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
    // Set environment variables
    process.env = {
      ...process.env,
      API_REQUEST_LIMIT: '100',
    };
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('shall reject requests that do not use the GET method', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    const { req, res } = mockRequestResponse('POST')
    await profile(req, res)
    expect(res.statusCode).toBe(405)
    expect(res._getData()).toEqual(JSON.stringify({ error: 'Method POST Not Allowed' }))
    expect(res._getHeaders()).toEqual({ allow: ['GET'], 'content-type': 'application/json' })
  })

  it('shall not proceed if user is not logged in', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
    const { req, res } = mockRequestResponse()
    await profile(req, res)
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
  })

  it('shall return the recipes and ai usage', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    Recipe.find = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockResolvedValue(stubRecipeBatch),
          }))
        })),
      }),
    );
    aigenerated.countDocuments = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(40)
      }),
    );
    const { req, res } = mockRequestResponse()
    await profile(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({ recipes: stubRecipeBatch, AIusage: 40 })
  })
  it('will respond with error if GET is rejected', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    Recipe.find = jest.fn().mockImplementation(
      () => ({
        populate: jest.fn().mockImplementation(() => ({
          lean: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockRejectedValue(new Error('Mocked rejection')),
          }))
        })),
      }),
    );
    const { req, res } = mockRequestResponse()
    await profile(req, res)
    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch recipes' })
  })

});