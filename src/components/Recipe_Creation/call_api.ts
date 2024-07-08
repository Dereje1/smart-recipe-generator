import axios from 'axios';
import { Ingredient, DietaryPreference, Recipe } from '../../types/index'

export const getRecipesFromAPI = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[]) => {
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

export const saveRecipes = async (recipes: Recipe[]) => {
    try {
        const { data } = await axios.post('/api/save-recipes', { recipes });
        return data;
    } catch (error) {
        console.error('Failed to fetch recipes:', error);
        return null;
    }
}

export const addIngredient = async (ingredientName: string) => {
    try {
        const { data } = await axios.post('/api/validate-ingredient', { ingredientName });
        return data;
    } catch (error) {
        console.error('Failed to add Ingredient:', error);
        return null;
    }
}