import axios from 'axios';
import { Ingredient, DietaryPreference } from '../../../types/index'

const getRecipesFromAPI = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[]) => {
    try {
        const { data } = await axios.post('/api/generate-recipes', {
            ingredients,
            dietaryPreferences,
        });

        return data;
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return null;
    }
};

export default getRecipesFromAPI;