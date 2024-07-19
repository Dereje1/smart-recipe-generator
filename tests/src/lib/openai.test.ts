/**
 * @jest-environment node
 */
import { generateRecipe, generateImages, validateIngredient } from "../../../src/lib/openai";
import aigenerated from "../../../src/lib/models/aigenerated";
import OpenAI from 'openai';
import { stubRecipeBatch } from "../../stub";
/* Mock open ai api */


jest.mock('openai', () => {
    const mockOpenAiInstance = {
        images: {
            generate: jest.fn(),
        },
        chat: {
            completions: {
                create: jest.fn(),
            },
        },
    };
    return jest.fn(() => (mockOpenAiInstance))

});

// mock db connection
jest.mock("../../../src/lib/mongodb", () => ({
    connectDB: () => Promise.resolve()
}))


describe('generating recipes from open ai', () => {
    let openai: any;
    beforeEach(() => {
        openai = new OpenAI();
    });
    afterEach(() => {
        openai = undefined
    });
    it('shall generate recipes given ingredients', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.resolve(
            {
                choices: [{ message: { content: '["TEST-RECIPE-A", "TEST-RECIPE-B"]' } }]
            }
        ))
        // mock db create query
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.resolve({ _id: 1234 }),
        );
        const ingredients = [
            {
                name: 'ingredient-1',
                id: '1'
            },
            {
                name: 'ingredient-2',
                id: '2'
            }
        ]
        const expectedPrompt = "\nI have the following ingredients: [{\"name\":\"ingredient-1\",\"id\":\"1\"},{\"name\":\"ingredient-2\",\"id\":\"2\"}] and dietary preferences: Keto,Vegetarian. Please provide me with three different delicious recipes. The response should be in the following JSON format without any additional text or markdown:\n[\n    {\n        \"name\": \"Recipe Name\",\n        \"ingredients\": [\n            {\"name\": \"Ingredient 1\", \"quantity\": \"quantity and unit\"},\n            {\"name\": \"Ingredient 2\", \"quantity\": \"quantity and unit\"},\n            ...\n        ],\n        \"instructions\": [\n            \"Step 1\",\n            \"Step 2\",\n            ...\n        ],\n        \"dietaryPreference\": [\"Preference 1\", \"Preference 2\", ...],\n        \"additionalInformation\": {\n            \"tips\": \"Some cooking tips or advice.\",\n            \"variations\": \"Possible variations of the recipe.\",\n            \"servingSuggestions\": \"Suggestions for serving the dish.\",\n            \"nutritionalInformation\": \"Nutritional information about the recipe.\"\n        }\n    },\n    ...\n]\nPlease ensure the recipes are diverse and use the ingredients listed. The recipes should follow the dietary preferences provided.The instructions should be ordered but not include the step numbers.\n"
        const result = await generateRecipe(ingredients, ['Keto', 'Vegetarian'], 'mockUserId')
        expect(result).toEqual({
            recipes: '["TEST-RECIPE-A", "TEST-RECIPE-B"]',
            openaiPromptId: 1234
        })
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
            { 
                "max_tokens": 1500, 
                "messages": [{ "content": expectedPrompt, "role": "user" }], 
                "model": "gpt-4o" 
            }
        )
    })

    it('shall return null for _id if open ai response can not be saved', async () => {
        // mock db create query
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.reject(),
        );
        const ingredients = [
            {
                name: 'ingredient-1',
                id: '1'
            },
            {
                name: 'ingredient-2',
                id: '2'
            }
        ]
        const result = await generateRecipe(ingredients, ['Keto', 'Vegetarian'], 'mockUserId')
        expect(result).toEqual({
            recipes: '["TEST-RECIPE-A", "TEST-RECIPE-B"]',
            openaiPromptId: "null-prompt-id"
        })
    })

    it('shall throw error if openai can not respond', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.reject())
        const ingredients = [
            {
                name: 'ingredient-1',
                id: '1'
            },
            {
                name: 'ingredient-2',
                id: '2'
            }
        ]
        try {
            await generateRecipe(ingredients, ['Keto', 'Vegetarian'], 'mockUserId')
        } catch (error) {
            expect(error).toEqual(new Error('Failed to generate recipe'))
        }

    })
})

describe('generating images of recipes from open ai', () => {
    let openai: any;
    beforeEach(() => {
        openai = new OpenAI();
    });
    afterEach(() => {
        openai = undefined
    });
    it('shall generate images given ingredients', async () => {
        // mock opena ai chat completion
        openai.images.generate = jest.fn().mockImplementation(() => Promise.resolve({ data: [{ url: 'http:/stub-ai-image-url' }] }))
        // mock db create query
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.resolve({ _id: 1234 }),
        );
        const result = await generateImages(stubRecipeBatch, 'mockUserId')
        expect(result).toEqual([
            { imgLink: 'http:/stub-ai-image-url', name: 'Recipe_1_name' },
            { imgLink: 'http:/stub-ai-image-url', name: 'Recipe_2_name' }
        ])
        expect(openai.images.generate).toHaveBeenNthCalledWith(1, { "model": "dall-e-3", "n": 1, "prompt": "Create an image of a delicious Recipe_1_name made of these ingredients: Recipe_1_Ingredient_1, Recipe_1_Ingredient_2. The image should be visually appealing and showcase the dish in an appetizing manner.", "size": "1024x1024" })
    })

    it('shall throw error if openai can not respond with image', async () => {
        // mock opena ai chat completion
        openai.images.generate = jest.fn().mockImplementation(() => Promise.reject())
        try {
            await generateImages(stubRecipeBatch, 'mockUserId')
        } catch (error) {
            expect(error).toEqual(new Error('Failed to generate image'))
        }

    })
})

describe('validating ingredients from open ai', () => {
    let openai: any;
    beforeEach(() => {
        openai = new OpenAI();
    });
    afterEach(() => {
        openai = undefined
    });
    it('shall generate recipes given ingredients', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.resolve(
            {
                choices: [{ message: { content: 'mock-ingredient-validation-response' } }]
            }
        ))
        // mock db create query
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.resolve({ _id: 1234 }),
        );

        const expectedPrompt = "You are a food ingredient validation assistant. Given this ingredient name: mock-ingredient, you will respond with a JSON object in the following format:\n\n{\n  \"isValid\": true/false,\n  \"possibleVariations\": [\"variation1\", \"variation2\", \"variation3\"]\n}\n\nThe \"isValid\" field should be true if the ingredient is commonly used in recipes and false otherwise. The \"possibleVariations\" field should be an array containing 2 or 3 variations or related ingredients to the provided ingredient name. If no variations or related ingredients are real and commonly used, return an empty array.\n\nDo not include any Markdown formatting or code blocks in your response. Return only valid JSON."
        const result = await validateIngredient('mock-ingredient', 'mockUserId')
        expect(result).toEqual('mock-ingredient-validation-response')
        //console.log(openai.chat.completions.create.mock.calls[0][0])
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
            { 
                "max_tokens": 800, 
                "messages": [{ "content": expectedPrompt, "role": "user" }], 
                "model": "gpt-4o" 
            }
        )
    })

    it('shall throw error if openai can not respond', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.reject())
        const ingredients = [
            {
                name: 'ingredient-1',
                id: '1'
            },
            {
                name: 'ingredient-2',
                id: '2'
            }
        ]
        try {
            await validateIngredient('mock-ingredient', 'mockUserId')
        } catch (error) {
            expect(error).toEqual(new Error('Failed to validate ingredient'))
        }

    })
})