import OpenAI from 'openai';
import { Ingredient, DietaryPreference, Recipe, ExtendedRecipe } from '../types/index';
import aiGenerated from '../models/aigenerated';
import { connectDB } from '../lib/mongodb';
import { ImagesResponse } from 'openai/resources';
import recipeModel from '../models/recipe';
import {
    getRecipeGenerationPrompt,
    getImageGenerationPrompt,
    getIngredientValidationPrompt,
    getRecipeNarrationPrompt,
    getRecipeTaggingPrompt,
    getChatAssistantSystemPrompt
} from './prompts';

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Save OpenAI responses in the database for logging/tracking
type SaveOpenaiResponsesType = {
    userId: string;
    prompt: string;
    response: any;
    model?: string;
};
const saveOpenaiResponses = async ({ userId, prompt, response, model }: SaveOpenaiResponsesType) => {
    try {
        await connectDB();
        const { _id } = await aiGenerated.create({
            userId,
            prompt,
            response,
            model,
        });
        return _id;
    } catch (error) {
        console.error('Failed to save response to db:', error);
        return null;
    }
};

type ResponseType = {
    recipes: string | null;
    openaiPromptId: string;
};

// Generate recipes by sending a chat completion request to OpenAI using ingredients and dietary preferences
export const generateRecipe = async (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[], userId: string): Promise<ResponseType> => {
    try {
        const prompt = getRecipeGenerationPrompt(ingredients, dietaryPreferences);
        const model = 'gpt-4o';
        const response = await openai.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });
        const _id = await saveOpenaiResponses({ userId, prompt, response, model });
        return { recipes: response.choices[0].message?.content, openaiPromptId: _id || 'null-prompt-id' };
    } catch (error) {
        console.error('Failed to generate recipe:', error);
        throw new Error('Failed to generate recipe');
    }
};

// Generate an image using DALL-E by sending an image generation prompt to OpenAI
const generateImage = (prompt: string, model: string): Promise<ImagesResponse> => {
    try {
        const response = openai.images.generate({
            model,
            prompt,
            n: 1,
            size: '1024x1024',
        });
        return response;
    } catch (error) {
        throw new Error('Failed to generate image');
    }
};

// Generate images for an array of recipes and return image links paired with recipe names
export const generateImages = async (recipes: Recipe[], userId: string) => {
    try {
        const model = 'dall-e-3';
        const imagePromises: Promise<ImagesResponse>[] = recipes.map(recipe =>
            generateImage(getImageGenerationPrompt(recipe.name, recipe.ingredients), model)
        );
        const images = await Promise.all(imagePromises);
        await saveOpenaiResponses({
            userId,
            prompt: `Image generation for recipe names ${recipes.map(r => r.name).join(' ,')} (note: not exact prompt)`,
            response: images,
            model
        });
        // Validate and map images safely
        const imagesWithNames = images.map((imageResponse, idx) => {
            const recipeName = recipes[idx].name;
            const url = imageResponse?.data?.[0]?.url;

            if (!url) {
                throw new Error(`Image generation failed for recipe: ${recipeName}`);
            }

            return {
                imgLink: url,
                name: recipeName,
            };
        });
        return imagesWithNames;
    } catch (error) {
        console.error('Error generating image:', error);
        throw new Error('Failed to generate image');
    }
};

// Validate an ingredient name by sending a prompt to OpenAI and returning its response
export const validateIngredient = async (ingredientName: string, userId: string): Promise<string | null> => {
    try {
        const prompt = getIngredientValidationPrompt(ingredientName);
        const model = 'gpt-4o';
        const response = await openai.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 800,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });
        return response.choices[0].message?.content;
    } catch (error) {
        console.error('Failed to validate ingredient:', error);
        throw new Error('Failed to validate ingredient');
    }
};

// Retrieve narrated text for a recipe by sending a narration prompt to OpenAI
const getRecipeNarration = async (recipe: ExtendedRecipe, userId: string): Promise<string | null> => {
    try {
        const prompt = getRecipeNarrationPrompt(recipe);
        console.info('Getting recipe narration text from OpenAI...');
        const model = 'gpt-4o';
        const response = await openai.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });
        const _id = await saveOpenaiResponses({ userId, prompt, response, model });
        return response.choices[0].message?.content;
    } catch (error) {
        console.error('Failed to generate recipe narration:', error);
        throw new Error('Failed to generate recipe narration');
    }
};

// Convert narrated text to speech (TTS) using OpenAI audio API and return an audio buffer
export const getTTS = async (recipe: ExtendedRecipe, userId: string): Promise<Buffer> => {
    try {
        const text = await getRecipeNarration(recipe, userId);
        if (!text) throw new Error('Unable to get text for recipe narration');
        // Randomly select a voice type from available options
        type voiceTypes = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
        const voiceChoices: voiceTypes[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        const voice = voiceChoices[Math.floor(Math.random() * voiceChoices.length)];
        console.info('Getting recipe narration audio from OpenAI...');
        const model = 'tts-1';
        const mp3 = await openai.audio.speech.create({
            model,
            voice,
            input: text,
        });
        const buffer = Buffer.from(await mp3.arrayBuffer());
        await saveOpenaiResponses({ userId, prompt: text, response: mp3, model });
        return buffer;
    } catch (error) {
        console.error('Failed to generate tts:', error);
        throw new Error('Failed to generate tts');
    }
};

// Generate tags for a recipe by sending a tagging prompt to OpenAI and updating the recipe document in the database
export const generateRecipeTags = async (recipe: ExtendedRecipe, userId: string): Promise<undefined> => {
    try {
        const prompt = getRecipeTaggingPrompt(recipe);
        const model = 'gpt-4o';
        const response = await openai.chat.completions.create({
            model,
            messages: [{
                role: 'user',
                content: prompt,
            }],
            max_tokens: 1500,
        });
        await saveOpenaiResponses({ userId, prompt, response, model });
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
                throw new Error(`Failed to parse tags from OpenAI response. --> ${jsonError}`);
            }
        }
        if (tagsArray.length) {
            const tags = tagsArray.map((tag: string) => ({ tag: tag.toLowerCase() }));
            const update = { $set: { tags } };
            console.info(`Adding tags -> ${tagsArray} for new recipe -> ${recipe.name} from OpenAI api`);
            await recipeModel.findByIdAndUpdate(recipe._id, update);
        }
        return;
    } catch (error) {
        console.error('Failed to generate tags for the recipe:', error);
        throw new Error(`Failed to generate tags for the recipe --> ${error}`);
    }
};

// Generate a chat response by sending a message to OpenAI and returning the assistant's reply
export const generateChatResponse = async (
    message: string,
    recipe: ExtendedRecipe,
    history: any[],
    userId: string
): Promise<{ reply: string; totalTokens: number }> => {
    try {
        const model = 'gpt-4o';
        const messages = [
            { role: 'system', content: getChatAssistantSystemPrompt(recipe) },
            ...history,
            { role: 'user', content: message },
        ];

        const response = await openai.chat.completions.create({
            model,
            messages,
            max_tokens: 1000,
        });

        const reply = response.choices?.[0]?.message?.content ?? 'Sorry, I had trouble responding.';
        const totalTokens = response.usage?.total_tokens ?? 0;

        // Save to DB only on first message
        if (history.length === 1) {
            await saveOpenaiResponses({
                userId,
                prompt: `Chat session started for recipe: ${recipe.name}, first message: ${message}`,
                response,
                model,
            });
        }

        return { reply, totalTokens };
    } catch (error) {
        console.error('Failed to generate chat response:', error);
        return { reply: 'Sorry, I had trouble responding.', totalTokens: 0 };
    }
};
