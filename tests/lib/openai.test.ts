/**
 * @jest-environment node
 */
import { generateRecipe, generateImages, validateIngredient, getTTS, generateRecipeTags, generateChatResponse } from "../../src/lib/openai";
import aigenerated from "../../src/models/aigenerated";
import recipe from "../../src/models/recipe";
import OpenAI from 'openai';
import { stubRecipeBatch } from "../stub";
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
        audio: {
            speech: {
                create: jest.fn()
            }
        }
    };
    return jest.fn(() => (mockOpenAiInstance))

});

// mock db connection
jest.mock("../../src/lib/mongodb", () => ({
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
        const expectedPrompt = `
I have the following ingredients: [{\"name\":\"ingredient-1\",\"id\":\"1\"},{\"name\":\"ingredient-2\",\"id\":\"2\"}] and dietary preferences: Keto,Vegetarian. Please provide me with three different delicious and diverse recipes. The response should be in the following JSON format without any additional text, markdown, or code formatting (e.g., no backticks):
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
        const normalizeWhitespace = (str: string) => str.replace(/\s+/g, ' ').trim();

        const expectedPrompt = normalizeWhitespace("Create a high-resolution, photorealistic image of a delicious Recipe_1_name made of these ingredients: Recipe_1_Ingredient_1 (Recipe_1_Ingredient_1_quantity_1), Recipe_1_Ingredient_2 (Recipe_1_Ingredient_2_quantity_2). The image should be visually appealing, showcasing the dish in an appetizing manner. It should be plated attractively on a clean white plate with natural lighting, highlighting key ingredients for visual appeal.");

        const call = openai.images.generate.mock.calls[0][0]; // Get the actual call arguments
        call.prompt = normalizeWhitespace(call.prompt); // Normalize the received prompt

        expect(call).toEqual({
            model: "dall-e-3",
            n: 1,
            prompt: expectedPrompt,
            size: "1024x1024",
        });
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

        const expectedPrompt = 'Act as a Food Ingredient Validation Assistant. Given the ingredient name: mock-ingredient, your task is to evaluate the ingredient and return a JSON object with exactly two keys:\n\n{ "isValid": true/false, "possibleVariations": ["variation1", "variation2", "variation3"] }\n\nRules:\n\nThe isValid field must be true if the ingredient is commonly used in recipes, and false otherwise.\nThe possibleVariations field must contain an array of 2 to 3 valid variations, alternative names, or related ingredients for the given ingredient.\nIf the ingredient appears to be a misspelling, include the corrected name(s) in this array.\nIf there are no recognized variations or corrections, return an empty array for possibleVariations.\nThe output must be strictly valid JSON without any additional text, markdown formatting, or code blocks.\nExamples: \nInput: "cheese" Expected Output: { "isValid": true, "possibleVariations": ["cheddar", "mozzarella", "parmesan"] }\n\nInput: "breakfast" Expected Output: { "isValid": false, "possibleVariations": [] }\n\nInput: "cuscus" Expected Output: { "isValid": false, "possibleVariations": ["couscous"] }'
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

describe('generating audio from open ai', () => {
    let openai: any;
    beforeEach(() => {
        openai = new OpenAI();
    });
    afterEach(() => {
        openai = undefined
    });
    it('shall generate audio given a recipe', async () => {
        const expectedPrompt = 'Convert the following recipe into a **clear, well-paced, and engaging spoken narration**.  \n- The tone should be **natural, informative, and confident**, like a professional chef explaining a recipe in a calm and collected manner.  \n- Keep it **concise and instructional**, focusing on delivering the steps in an **efficient and natural way** without excessive enthusiasm.  \n- Transitions should be **smooth but to the point**—avoid over-explaining or dramatizing the process.  \n\n---\n\n### Recipe: **Recipe_1_name**\n\n#### Ingredients:\n- **Recipe_1_Ingredient_1_quantity_1** of **Recipe_1_Ingredient_1**\n- **Recipe_1_Ingredient_2_quantity_2** of **Recipe_1_Ingredient_2**\n\n#### Instructions:\n1. Recipe_1_Instructions_1.\n2. Recipe_1_Instructions_2.\n\n#### Tips:\nRecipe_1_tips\n\n#### Variations:\nRecipe_1_variations\n\n#### Serving Suggestions:\nRecipe_1_servingSuggestions\n\n#### Nutritional Info:\nRecipe_1_nutritionalInformation\n\n\n---\n\n🎙 **Narration Guidelines:**  \n- Deliver the narration in a **calm and professional manner**, without excessive excitement.  \n- Read ingredients **clearly and efficiently**—avoid unnecessary emphasis or dramatization.  \n- Guide the user **step-by-step with smooth but direct transitions**, keeping it **practical and instructional**.  \n- End with a **brief, professional wrap-up**, reinforcing the dish’s appeal in a **neutral and informative way**.  \n- **Keep it around 60-90 seconds**—engaging but not rushed.  \n\nEnsure the narration **sounds knowledgeable and practical**, maintaining a **professional and refined delivery.**';
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.resolve(
            {
                choices: [{ message: { content: 'audio friendly prompt' } }]
            }
        ))
        // mock opena ai tts
        openai.audio.speech.create = jest.fn().mockImplementation(() => Promise.resolve(
            {
                arrayBuffer: jest.fn(() => Promise.resolve(
                    'mock buffer'
                ))
            }
        ))
        // mock db create query
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.resolve({ _id: 1234 }),
        );

        const result = await getTTS(stubRecipeBatch[0], 'mockUserId')
        expect(result).toEqual(Buffer.from('mock buffer'))
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
            {
                "max_tokens": 1500,
                "messages": [{ "content": expectedPrompt, "role": "user" }],
                "model": "gpt-4o"
            }
        )
        expect(openai.audio.speech.create).toHaveBeenCalledWith(
            {
                "model": 'tts-1',
                "input": 'audio friendly prompt',
                "voice": expect.any(String)
            }
        )
    })

    it('shall throw error if openai can not respond', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.reject())

        try {
            await getTTS(stubRecipeBatch[0], 'mockUserId')
        } catch (error) {
            expect(error).toEqual(new Error('Failed to generate tts'))
        }

    })
})

describe('generating recipe tags from openAI', () => {
    let openai: any;
    beforeEach(() => {
        openai = new OpenAI();
    });
    afterEach(() => {
        openai = undefined
    });
    it('shall generate tags given a recipe', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.resolve(
            {
                choices: [{ message: { content: JSON.stringify(["tag1", "tag2"]) } }]
            }
        ))
        // mock db create querys
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.resolve({ _id: 1234 }),
        );
        recipe.findByIdAndUpdate = jest.fn().mockImplementation(
            () => Promise.resolve()
        );

        const expectedPrompt = 'Please generate **10 unique, single-word tags** for the following recipe in a **pure JSON array format**.\n\n**Rules for the response:**\n1. The response **must be a valid JSON array** and **must NOT be wrapped in markdown, backticks, or any other formatting**.\n2. The array should contain **10 unique, single-word tags** that:\n   - **Accurately describe the recipe** based on its name, ingredients, dietary preferences, and additional information.\n   - **Are commonly searched terms** for similar recipes.\n   - **Include keywords** related to the recipe type, cuisine, or dietary category.\n   - **Are concise**, avoiding technical or uncommon terms.\n\n### **Example Valid Response:**\n`["vegetarian", "dessert", "corn", "pudding", "Indian", "sweet", "almond", "cardamom", "saffron", "coconut"]`\n\n### **Recipe Details:**\n- **Recipe Name**: Recipe_1_name\n- **Main Ingredients**: Recipe_1_Ingredient_1, Recipe_1_Ingredient_2\n- **Dietary Preferences**: Recipe_1_preference_1, Recipe_1_preference_2\n- **Additional Information**:\n  - **Tips**: Recipe_1_tips\n  - **Variations**: Recipe_1_variations\n  - **Serving Suggestions**: Recipe_1_servingSuggestions\n  - **Nutritional Information**: Recipe_1_nutritionalInformation'

        const result = await generateRecipeTags(stubRecipeBatch[0], 'mockUserId')
        expect(result).toEqual(undefined)
        //console.log(openai.chat.completions.create.mock.calls[0][0])
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
            {
                "max_tokens": 1500,
                "messages": [{ "content": expectedPrompt, "role": "user" }],
                "model": "gpt-4o"
            }
        )
    })

    it('shall throw an error if it fails to parse the reponse from open ai', async () => {
        // mock opena ai chat completion
        openai.chat.completions.create = jest.fn().mockImplementation(() => Promise.resolve(
            {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            "invalid json": true
                        })
                    }
                }]
            }
        ))
        // mock db create querys
        aigenerated.create = jest.fn().mockImplementation(
            () => Promise.resolve({ _id: 1234 }),
        );
        recipe.findByIdAndUpdate = jest.fn().mockImplementation(
            () => Promise.resolve()
        );
        try {
            await generateRecipeTags(stubRecipeBatch[0], 'mockUserId')
        } catch (error) {
            expect(error).toEqual(new Error('Failed to generate tags for the recipe --> Error: Failed to parse tags from OpenAI response. --> Error: Invalid JSON structure: Expected an array of strings.'))
        }
    })
})

describe('generating chat responses', () => {
    let openai: any;

    beforeEach(() => {
        openai = new OpenAI();
    });

    afterEach(() => {
        openai = undefined;
    });

    it('shall return AI response from OpenAI given message and history', async () => {
        const mockContent = 'You can substitute eggs with flaxseed.';
        openai.chat.completions.create = jest.fn().mockResolvedValue({
            choices: [{ message: { content: mockContent } }],
            usage: { total_tokens: 1000 }
        });

        const expectedPrompt = 'You are a helpful recipe assistant. You only respond to questions that are directly related to the following recipe:\n\nName: Recipe_1_name\nIngredients: Recipe_1_Ingredient_1_quantity_1 Recipe_1_Ingredient_1, Recipe_1_Ingredient_2_quantity_2 Recipe_1_Ingredient_2\nDietary Preferences: Recipe_1_preference_1, Recipe_1_preference_2\nInstructions: Recipe_1_Instructions_1.,Recipe_1_Instructions_2.\nTips: Recipe_1_tips\nVariations: Recipe_1_variations\nServing Suggestions: Recipe_1_servingSuggestions\nNutritional Info: Recipe_1_nutritionalInformation\n\nYou may provide useful suggestions about ingredient substitutions, dietary modifications, cooking techniques, tools, or serving advice — as long as they apply specifically to this recipe.\n\nIf the user asks about anything not related to this recipe — including general cooking topics, science, history, entertainment, or other off-topic subjects — politely decline and guide them back to questions about the recipe: Recipe_1_name.'

        const message = "What can I use instead of eggs?";
        const history: string[] = ['chat history 1'];
        const response = await generateChatResponse(message, stubRecipeBatch[0], history, 'mockUserId');
        expect(response).toEqual({ reply: mockContent, totalTokens: 1000 });
        expect(openai.chat.completions.create).toHaveBeenCalledWith(
            {
                "max_tokens": 1000,
                "messages": [{ "content": expectedPrompt, "role": "system" }, 'chat history 1', { role: 'user', content: message }],
                "model": "gpt-4o"
            }
        )
    });

    it('shall return fallback message if OpenAI fails', async () => {
        openai.chat.completions.create = jest.fn().mockRejectedValue(new Error('fail'));
        const response = await generateChatResponse('What can I use?', stubRecipeBatch[0], [], 'mockUserId');
        expect(response).toEqual({reply: 'Sorry, I had trouble responding.', totalTokens: 0 });
    });
});