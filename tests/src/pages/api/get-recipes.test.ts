/**
 * @jest-environment node
 */
import recipes from '../../../../src/pages/api/get-recipes';
import Recipe from '../../../../src/lib/models/recipe';
import { mockRequestResponse } from '../../../apiMocks';
import { stubRecipeBatch, getServerSessionStub } from '../../../stub';
import * as nextAuth from 'next-auth';

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

  it('shall return the recipes', async () => {
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
    const { req, res } = mockRequestResponse()
    await recipes(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual(stubRecipeBatch)
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
    await recipes(req, res)
    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch recipes' })
  })

});