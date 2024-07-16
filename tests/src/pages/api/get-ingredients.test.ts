/**
 * @jest-environment node
 */
import getIngredients from '../../../../src/pages/api/get-ingredients';
import Ingredient from '../../../../src/lib/models/ingredient';
import { mockRequestResponse } from '../../../apiMocks';
import { ingredientListStub } from '../../../stub';

// mock db connection
jest.mock('../../../../src/lib/mongodb', () => ({
  connectDB: () => Promise.resolve()
}))

describe('Getting the ingredient list', () => {
  it('shall return the ingredients', async () => {
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
    expect(res._getJSONData()).toEqual(ingredientListStub)
  })
  it('will respond with error if GET is rejected', async () => {
    Ingredient.find = jest.fn().mockImplementation(
        () => ({
          sort: jest.fn().mockImplementation(() => ({
            exec: jest.fn().mockRejectedValue(new Error('Mocked rejection'))
          })),
        }),
      );
    const { req, res } = mockRequestResponse()
    await getIngredients(req, res)
    expect(res.statusCode).toBe(500)
    expect(res._getJSONData()).toEqual({ error: 'Failed to fetch ingredients' })
  })

});