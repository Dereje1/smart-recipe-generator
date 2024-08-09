import { getSession } from "next-auth/react"
import axios from "axios";
import { updateRecipeList, getFilteredRecipes, getServerSidePropsUtility, call_api } from "../../../src/utils/utils";
import { stubRecipeBatch } from "../../stub";

jest.mock('axios');
jest.mock("next-auth/react")


describe('Refreshing a list of recipes', () => {
    it('will update a lit of recipes', () => {
        const newRecipe = {
            ...stubRecipeBatch[1],
            likedBy: []
        }
        const updatedList = updateRecipeList(stubRecipeBatch, newRecipe);
        expect(updatedList[1].likedBy).toEqual([])
    })
})

describe('Filtering recipes (search)', () => {
    it('will return the list if no search term found', () => {
        const result = getFilteredRecipes(stubRecipeBatch, null);
        expect(result).toEqual(stubRecipeBatch)
    })
    it('will filter by name', () => {
        const result = getFilteredRecipes(stubRecipeBatch, 'recipe_1');
        expect(result).toEqual([stubRecipeBatch[0]])
    })
    it('will filter by ingredients', () => {
        const result = getFilteredRecipes(stubRecipeBatch, 'recipe_2_ingredi');
        expect(result).toEqual([stubRecipeBatch[1]])
    })
    it('will filter by dietary preferences', () => {
        const result = getFilteredRecipes(stubRecipeBatch, 'recipe_1_preference_1');
        expect(result).toEqual([stubRecipeBatch[0]])
    })
})

describe('getServerSideProps abstraction utility', () => {
    let axiosSpy: any;
    beforeEach(() => {
        axiosSpy = jest.spyOn(axios, 'get');
    })
    afterEach(() => {
        axiosSpy.mockClear()
    })
    it('will redirect to root if there is no user session', async () => {
        (getSession as jest.Mock).mockImplementationOnce(() => null)
        const result = await getServerSidePropsUtility({} as any, '/any')
        expect(result).toEqual({ redirect: { destination: '/', permanent: false } })
    })

    it('will succesfully return the props', async () => {
        (getSession as jest.Mock).mockImplementationOnce(() => 'active session')
        axiosSpy.mockImplementationOnce(() => Promise.resolve({ data: 'succesfully got recipe data' }))
        const result = await getServerSidePropsUtility({ req: { headers: { cookie: 'a cookie' } } } as any, '/any')
        expect(result).toEqual({ props: { recipes: 'succesfully got recipe data' } })
    })

    it('will return an empty array for the props if the request gets rejected', async () => {
        (getSession as jest.Mock).mockImplementationOnce(() => 'active session')
        axiosSpy.mockImplementationOnce(() => Promise.reject())
        const result = await getServerSidePropsUtility({ req: { headers: { cookie: 'a cookie' } } } as any, '/any')
        expect(result).toEqual({ props: { recipes: [] } })
    })
})

describe('The api call making utility', () => {
    it('shall execute', async () => {
        (axios.get as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await call_api({address: 'mock-address'});
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.get as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('API call failed')))
        await expect(call_api({ address: 'mock-address' })).rejects.toThrow('API call failed');
    })
})