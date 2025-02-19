import OpenAI from 'openai';
import { Ingredient, DietaryPreference, Recipe, ExtendedRecipe } from '../types/index'
import aiGenerated from '../models/aigenerated';
import { connectDB } from '../lib/mongodb';
import { ImagesResponse } from 'openai/resources';
import recipeModel from '../models/recipe';

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
    const allIngredients = ingredients.map(ingredient => `${ingredient.name} (${ingredient.quantity})`).join(', ');
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

const getRecipeNarrationPrompt = (recipe: ExtendedRecipe) => {
    if (!recipe || !recipe.name || !recipe.ingredients || !recipe.instructions) {
        return "Invalid recipe data. Please provide a valid recipe.";
    }

    const { name, ingredients, instructions, additionalInformation } = recipe;

    return `Convert the following recipe into a **clear, well-paced, and engaging spoken narration**.  
- The tone should be **natural, informative, and confident**, like a professional chef explaining a recipe in a calm and collected manner.  
- Keep it **concise and instructional**, focusing on delivering the steps in an **efficient and natural way** without excessive enthusiasm.  
- Transitions should be **smooth but to the point**—avoid over-explaining or dramatizing the process.  

---

### Recipe: **${name}**

#### Ingredients:
${ingredients.map(ing => `- **${ing.quantity}** of **${ing.name}**`).join("\n")}

#### Instructions:
${instructions.map((step, index) => `${index + 1}. ${step}`).join("\n")}

${additionalInformation?.variations ? `#### Variations:\n${additionalInformation.variations}\n` : ""}
${additionalInformation?.servingSuggestions ? `#### Serving Suggestions:\n${additionalInformation.servingSuggestions}\n` : ""}
${additionalInformation?.nutritionalInformation ? `#### Nutritional Info:\n${additionalInformation.nutritionalInformation}\n` : ""}

---

🎙 **Narration Guidelines:**  
- Deliver the narration in a **calm and professional manner**, without excessive excitement.  
- Read ingredients **clearly and efficiently**—avoid unnecessary emphasis or dramatization.  
- Guide the user **step-by-step with smooth but direct transitions**, keeping it **practical and instructional**.  
- End with a **brief, professional wrap-up**, reinforcing the dish’s appeal in a **neutral and informative way**.  
- **Keep it around 60-90 seconds**—engaging but not rushed.  

Ensure the narration **sounds knowledgeable and practical**, maintaining a **professional and refined delivery.**`;
};


const getRecipeTaggingPrompt = (recipe: ExtendedRecipe) => {
    const { name, ingredients, dietaryPreference, additionalInformation } = recipe;

    // Extract ingredient names
    const ingredientNames = ingredients.map(ingredient => ingredient.name).join(', ');

    // Extract additional information
    const { tips, variations, servingSuggestions, nutritionalInformation } = additionalInformation;

    // Construct the prompt
    const prompt = `Please provide 10 unique, single-word tags for the following recipe in a pure JSON array format. The tags should accurately and specifically describe the recipe, including its name, main ingredients, dietary preferences, and additional information. Do not number the tags. Your response should only include a single JSON array and must NOT be wrapped in JSON markdown markers.

Recipe Name: ${name}
Main Ingredients: ${ingredientNames}
Dietary Preferences: ${dietaryPreference.join(', ')}
Additional Information:
- Tips: ${tips}
- Variations: ${variations}
- Serving Suggestions: ${servingSuggestions}
- Nutritional Information: ${nutritionalInformation}`;

    return prompt;
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

const getRecipeNarration = async (recipe: ExtendedRecipe, userId: string): Promise<string | null> => {
    try {
        const prompt = getRecipeNarrationPrompt(recipe);
        console.info('Getting recipe narration text from OpenAI...')
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });

        const _id = await saveOpenaiResponses({ userId, prompt, response })

        return response.choices[0].message?.content
    } catch (error) {
        console.error('Failed to generate recipe narration:', error);
        throw new Error('Failed to generate recipe narration');
    }
};

export const getTTS = async (recipe: ExtendedRecipe, userId: string): Promise<Buffer> => {
    try {
        const text = await getRecipeNarration(recipe, userId);
        if (!text) throw new Error('Unable to get text for recipe narration');
        // randomly choose a voice type from the available options
        type voiceTypes = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
        const voiceChoices: voiceTypes[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        const voice = voiceChoices[Math.floor(Math.random() * voiceChoices.length)]
        console.info('Getting recipe narration audio from OpenAI...')
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice,
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());

        await saveOpenaiResponses({ userId, prompt: text, response: mp3 })

        return buffer
    } catch (error) {
        console.error('Failed to generate tts:', error);
        throw new Error('Failed to generate tts');
    }
};

export const generateRecipeTags = async (recipe: ExtendedRecipe, userId: string): Promise<undefined> => {
    try {
        const prompt = getRecipeTaggingPrompt(recipe);
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });

        const _id = await saveOpenaiResponses({ userId, prompt, response })

        const [tagsObject] = response.choices;
        const rawTags = tagsObject.message?.content?.trim();
        let tagsArray: string[] = [];
        if (rawTags) {
            try {
                tagsArray = JSON.parse(rawTags);
                if (!Array.isArray(tagsArray) || tagsArray.some(tag => typeof tag !== 'string')) {
                    throw new Error('Invalid JSON structure: Expected an array of strings.');
                }
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                console.error('Received malformed JSON:', rawTags);
                // Decide whether to throw an error or continue without tags
                throw new Error(`Failed to parse tags from OpenAI response. --> ${jsonError}`);
            }
        }
        if (tagsArray.length) {
            const tags = tagsArray.map((tag: string) => ({ tag }));
            const update = { $set: { tags } };
            console.info(`Adding tags -> ${tagsArray} for new recipe -> ${recipe.name} from OpenAI api`);
            await recipeModel.findByIdAndUpdate(recipe._id, update);
        }
        return
    } catch (error) {
        console.error('Failed to generate tags for the recipe:', error);
        throw new Error(`Failed to generate tags for the recipe --> ${error}`);
    }
};