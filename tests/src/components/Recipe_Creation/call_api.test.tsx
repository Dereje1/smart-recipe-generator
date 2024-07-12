import { addIngredient, getRecipesFromAPI, saveRecipes } from "../../../../src/components/Recipe_Creation/call_api";
import axios from "axios";

jest.mock('axios');

describe('The addIngredient api call', () => {
    it('shall execute', async () => {
        (axios.post as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await addIngredient('an ingredient');
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.post as jest.Mock).mockImplementationOnce(() => Promise.reject())
        const ans = await addIngredient('an ingredient');
        expect(ans).toBe(null)
    })
})

describe('The getRecipesFromAPI api call', () => {
    it('shall execute', async () => {
        (axios.post as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await getRecipesFromAPI([],[]);
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.post as jest.Mock).mockImplementationOnce(() => Promise.reject())
        const ans = await getRecipesFromAPI([],[]);
        expect(ans).toBe(null)
    })
})

describe('The saveRecipes api call', () => {
    it('shall execute', async () => {
        (axios.post as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await saveRecipes([]);
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.post as jest.Mock).mockImplementationOnce(() => Promise.reject())
        const ans = await saveRecipes([]);
        expect(ans).toBe(null)
    })
})