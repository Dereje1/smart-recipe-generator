import axios from 'axios';

export const likeRecipe = async (recipeId: string) => {
    try {
        const { data } = await axios.put('/api/like-recipe', { recipeId });
        return data;
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return null;
    }
}