import OpenAI from 'openai';
import { Ingredient, DietaryPreference } from '../types/index'
import aiGenerated from './models/aigenerated';
import { connectDB } from '../lib/mongodb';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const getPrompt = (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[]) => `
I have the following ingredients: ${JSON.stringify(ingredients)} ${dietaryPreferences.length ? `and dietary preferences: ${dietaryPreferences.join(',')}` : ''}. Please provide me with three different delicious recipes. The response should be in the following JSON format without any additional text or markdown:
[
    {
        "name": "Recipe Name",
        "ingredients": [
            {"name": "Ingredient 1", "quantity": "quantity and unit"},
            {"name": "Ingredient 2", "quantity": "quantity and unit"},
            ...
        ],
        "instructions": [
            "Step 1",
            "Step 2",
            ...
        ],
        "dietaryPreference": ["Preference 1", "Preference 2", ...],
        "additionalInformation": {
            "tips": "Some cooking tips or advice.",
            "variations": "Possible variations of the recipe.",
            "servingSuggestions": "Suggestions for serving the dish.",
            "nutritionalInformation": "Nutritional information about the recipe."
        }
    },
    ...
]
Please ensure the recipes are diverse and use the ingredients listed. The recipes should follow the dietary preferences provided.The instructions should be ordered but not include the step numbers.
`;

export const generateRecipe = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[], userId: string): Promise<string | null> => {
    try {
        const prompt = getPrompt(ingredients, dietaryPreferences);
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });

        await connectDB();
        await aiGenerated.create({
            userId,
            prompt,
            response,
        });

        return response.choices[0].message?.content
    } catch (error) {
        console.error('Failed to generate recipe:', error);
        throw new Error('Failed to generate recipe');
    }
};
