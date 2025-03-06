/**
 * @jest-environment node
 */
import getIngredients from '../../../src/pages/api/get-ingredients';
import Ingredient from '../../../src/models/ingredient';
import aigenerated from '../../../src/models/aigenerated';
import { mockRequestResponse } from '../../apiMocks';
import { ingredientListStub, getServerSessionStub } from '../../stub';
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

describe('Getting the ingredient list', () => {
  let getServerSessionSpy: any
  beforeEach(() => {
    // Set environment variables
    process.env = {
      ...process.env,
      API_REQUEST_LIMIT: '5',
    };
    getServerSessionSpy = jest.spyOn(nextAuth, 'getServerSession')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('shall not proceed if user is not logged in', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(null))
    const { req, res } = mockRequestResponse()
    await getIngredients(req, res)
    expect(res.statusCode).toBe(401)
    expect(res._getJSONData()).toEqual({ error: 'You must be logged in.' })
  })

  it('shall respond accordingly if rate limit hit', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    aigenerated.countDocuments = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(5)
      }),
    );
    const { req, res } = mockRequestResponse()
    await getIngredients(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({ ingredientList: [], reachedLimit: true })
  })

  it('shall return the ingredients', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    aigenerated.countDocuments = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(4)
      }),
    );
    Ingredient.find = jest.fn().mockImplementation(
      () => ({
        sort: jest.fn().mockImplementation(() => ({
          exec: jest.fn().mockResolvedValue(ingredientListStub)
        })),
      }),
    );
    const { req, res } = mockRequestResponse()
    await getIngredients(req, res)
    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({ ingredientList: ingredientListStub, reachedLimit: false })
  })
  it('will respond with error if GET is rejected', async () => {
    getServerSessionSpy.mockImplementationOnce(() => Promise.resolve(getServerSessionStub))
    aigenerated.countDocuments = jest.fn().mockImplementation(
      () => ({
        exec: jest.fn().mockResolvedValue(4)
      }),
    );
    const { req, res } = mockRequestResponse()
    await getIngredients(req, res)
    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch ingredients' })
  })

});