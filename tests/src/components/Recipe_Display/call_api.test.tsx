import { likeRecipe, deleteRecipe } from "../../../../src/components/Recipe_Display/call_api";
import axios from "axios";

jest.mock('axios');

describe('The like api call', () => {
    it('shall execute', async () => {
        (axios.put as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await likeRecipe('some recipe');
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.put as jest.Mock).mockImplementationOnce(() => Promise.reject())
        const ans = await likeRecipe('some recipe');
        expect(ans).toBe(null)
    })
})

describe('The delete api call', () => {
    it('shall execute', async () => {
        (axios.delete as jest.Mock).mockImplementationOnce(() => Promise.resolve({ data: 'succesfully executed' }))
        const ans = await deleteRecipe('some recipe id');
        expect(ans).toBe('succesfully executed')
    })
    it('shall handle failures', async () => {
        (axios.delete as jest.Mock).mockImplementationOnce(() => Promise.reject())
        const ans = await deleteRecipe('some recipe id');
        expect(ans).toBe(null)
    })
})