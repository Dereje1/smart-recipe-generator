import OpenAI from 'openai';
import { Ingredient, DietaryPreference, Recipe } from '../types/index'
import aiGenerated from './models/aigenerated';
import { connectDB } from '../lib/mongodb';
import { ImagesResponse } from 'openai/resources';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const saveOpenaiResponses = async ({ userId, prompt, response }: { userId: string, prompt: string, response: any }) => {
    try {
        await connectDB();
        const { _id } = await aiGenerated.create({
            userId,
            prompt,
            response,
        });
        return _id
    } catch (error) {
        console.error('Failed to save response to db:', error);
        return null
    }
}

const getRecipeGenerationPrompt = (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[]) => `
I have the following ingredients: ${JSON.stringify(ingredients)} ${dietaryPreferences.length ? `and dietary preferences: ${dietaryPreferences.join(',')}` : ''}. Please provide me with three different delicious and diverse recipes. The response should be in the following JSON format without any additional text, markdown, or code formatting (e.g., no backticks):
[
    {
        "name": "Recipe Name",
        "ingredients": [
            {"name": "Ingredient 1", "quantity": "quantity and unit"},
            {"name": "Ingredient 2", "quantity": "quantity and unit"},
            ...
        ],
        "instructions": [
            "Do this first.",
            "Then do this.",
            ...
        ],
        "dietaryPreference": ["Preference 1", "Preference 2", ...],
        "additionalInformation": {
            "tips": "Provide practical cooking tips, such as using the right cookware or ingredient substitutions.",
            "variations": "Suggest creative variations for the recipe, like adding more vegetables or using different proteins.",
            "servingSuggestions": "Include ideas for how to serve the dish (e.g., with toast, salad, or specific sauces).",
            "nutritionalInformation": "Provide approximate nutritional details (e.g., calories, protein, fat, etc.)."
        }
    },
    ...
]
Please ensure the recipes are diverse in type or cuisine (e.g., different meal categories or international flavors) and use all the ingredients listed unless dietary preferences or practicality dictate otherwise. Quantities must include appropriate units (e.g., grams, cups, teaspoons) for precision. Provide clear, detailed instructions suitable for someone with basic cooking skills. The instructions should be ordered but not include step numbers. Additionally, ensure the recipes respect the dietary preferences provided by suggesting suitable alternatives where necessary. The JSON must be valid and parsable without any additional text or formatting outside the JSON structure.
`;




const getImageGenerationPrompt = (recipeName: string, ingredients: Recipe['ingredients']): string => {
    const allIngredients = ingredients.map(ingredient => `${ingredient.name}`).join(', ');
    const prompt = `
        Create a high-resolution, photorealistic image of a delicious ${recipeName} made of these ingredients: ${allIngredients}. 
        The image should be visually appealing, showcasing the dish in an appetizing manner. 
        It should be plated attractively on a clean white plate with natural lighting, highlighting key ingredients for visual appeal.
    `;
    return prompt.trim();
};

const getIngredientValidationPrompt = (ingredientName: string): string => {
    return `You are a food ingredient validation assistant. Given this ingredient name: ${ingredientName}, you will respond with a JSON object in the following format:

{
  "isValid": true/false,
  "possibleVariations": ["variation1", "variation2", "variation3"]
}

The "isValid" field should be true if the ingredient is commonly used in recipes and false otherwise. The "possibleVariations" field should be an array containing 2 or 3 variations or related ingredients to the provided ingredient name. If no variations or related ingredients are real and commonly used, return an empty array.

Do not include any Markdown formatting or code blocks in your response. Return only valid JSON.`
}


type ResponseType = {
    recipes: string | null
    openaiPromptId: string
}
export const generateRecipe = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[], userId: string): Promise<ResponseType> => {
    try {
        const prompt = getRecipeGenerationPrompt(ingredients, dietaryPreferences);
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });

        const _id = await saveOpenaiResponses({ userId, prompt, response })

        return { recipes: response.choices[0].message?.content, openaiPromptId: _id || 'null-prompt-id' }
    } catch (error) {
        console.error('Failed to generate recipe:', error);
        throw new Error('Failed to generate recipe');
    }
};


// Function to call the OpenAI API to generate an image
const generateImage = (prompt: string): Promise<ImagesResponse> => {
    try {
        const response = openai.images.generate({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
        });

        // Return the response containing the image data
        return response;
    } catch (error) {
        throw new Error('Failed to generate image');
    }
};


export const generateImages = async (recipes: Recipe[], userId: string) => {
    try {
        const imagePromises: Promise<ImagesResponse>[] = recipes.map(recipe => generateImage(getImageGenerationPrompt(recipe.name, recipe.ingredients)));

        const images = await Promise.all(imagePromises);

        await saveOpenaiResponses({
            userId,
            prompt: `Image generation for recipe names ${recipes.map(r => r.name).join(' ,')} (note: not exact prompt)`,
            response: images
        })

        const imagesWithNames = images.map((imageResponse, idx) => (
            {
                imgLink: imageResponse.data[0].url,
                name: recipes[idx].name,
            }
        ));

        return imagesWithNames;
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error('Failed to generate image');
    }

};

export const validateIngredient = async (ingredientName: string, userId: string): Promise<string | null> => {
    try {
        const prompt = getIngredientValidationPrompt(ingredientName);
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 800,
        });

        await saveOpenaiResponses({ userId, prompt, response })

        return response.choices[0].message?.content
    } catch (error) {
        console.error('Failed to validate ingredient:', error);
        throw new Error('Failed to validate ingredient');
    }
};