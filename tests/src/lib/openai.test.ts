/**
 * @jest-environment node
 */
import { generateRecipe, generateImages, validateIngredient, getTTS } from "../../../src/lib/openai";
import aigenerated from "../../../src/models/aigenerated";
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
        audio: {
            speech: {
                create: jest.fn()
            }
        }
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

describe('generating audio from open ai', () => {
    let openai: any;
    beforeEach(() => {
        openai = new OpenAI();
    });
    afterEach(() => {
        openai = undefined
    });
    it('shall generate audio given a recipe', async () => {
        const expectedPrompt = 'Convert the following recipe into a **clear, well-paced, and engaging spoken narration**.  \n- The tone should be **natural, informative, and confident**, like a professional chef explaining a recipe in a calm and collected manner.  \n- Keep it **concise and instructional**, focusing on delivering the steps in an **efficient and natural way** without excessive enthusiasm.  \n- Transitions should be **smooth but to the point**—avoid over-explaining or dramatizing the process.  \n\n---\n\n### Recipe: **Recipe_1_name**\n\n#### Ingredients:\n- **Recipe_1_Ingredient_1_quantity_1** of **Recipe_1_Ingredient_1**\n- **Recipe_1_Ingredient_2_quantity_2** of **Recipe_1_Ingredient_2**\n\n#### Instructions:\n1. Recipe_1_Instructions_1.\n2. Recipe_1_Instructions_2.\n\n#### Variations:\nRecipe_1_variations\n\n#### Serving Suggestions:\nRecipe_1_servingSuggestions\n\n#### Nutritional Info:\nRecipe_1_nutritionalInformation\n\n\n---\n\n🎙 **Narration Guidelines:**  \n- Deliver the narration in a **calm and professional manner**, without excessive excitement.  \n- Read ingredients **clearly and efficiently**—avoid unnecessary emphasis or dramatization.  \n- Guide the user **step-by-step with smooth but direct transitions**, keeping it **practical and instructional**.  \n- End with a **brief, professional wrap-up**, reinforcing the dish’s appeal in a **neutral and informative way**.  \n- **Keep it around 60-90 seconds**—engaging but not rushed.  \n\nEnsure the narration **sounds knowledgeable and practical**, maintaining a **professional and refined delivery.**';
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