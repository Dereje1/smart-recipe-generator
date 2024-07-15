/**
 * @jest-environment node
 */
import recipes from '../../../../src/pages/api/get-recipes';
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

describe('Getting recipes for the home page', () => {
  it('shall not proceed if user is not logged in', async () => {
    (getServerSession as jest.Mock).mockImplementationOnce(()=> Promise.resolve(null))
    const { req, res } = mockRequestResponse()
    await recipes(req, res)
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ message: 'You must be logged in.' })
  })

  it('shall return the recipes', async () => {
    (getServerSession as jest.Mock).mockImplementationOnce(()=> Promise.resolve({
      user: {
        id: '6687d83725254486590fec59'
      },
      expires: 'some time'
    }))
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
    (getServerSession as jest.Mock).mockImplementationOnce(()=> Promise.resolve({
      user: {
        id: '6687d83725254486590fec59'
      },
      expires: 'some time'
    }))
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