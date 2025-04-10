import { Ingredient, DietaryPreference, Recipe, ExtendedRecipe } from '../types/index'

export const getRecipeGenerationPrompt = (ingredients: Ingredient[], dietaryPreferences: DietaryPreference[]) => `
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

export const getImageGenerationPrompt = (recipeName: string, ingredients: Recipe['ingredients']): string => {
    const allIngredients = ingredients.map(ingredient => `${ingredient.name} (${ingredient.quantity})`).join(', ');
    const prompt = `
        Create a high-resolution, photorealistic image of a delicious ${recipeName} made of these ingredients: ${allIngredients}. 
        The image should be visually appealing, showcasing the dish in an appetizing manner. 
        It should be plated attractively on a clean white plate with natural lighting, highlighting key ingredients for visual appeal.
    `;
    return prompt.trim();
};

export const getIngredientValidationPrompt = (ingredientName: string): string => {
    const prompt = `Act as a Food Ingredient Validation Assistant. Given the ingredient name: ${ingredientName}, your task is to evaluate the ingredient and return a JSON object with exactly two keys:

{ "isValid": true/false, "possibleVariations": ["variation1", "variation2", "variation3"] }

Rules:

The isValid field must be true if the ingredient is commonly used in recipes, and false otherwise.
The possibleVariations field must contain an array of 2 to 3 valid variations, alternative names, or related ingredients for the given ingredient.
If the ingredient appears to be a misspelling, include the corrected name(s) in this array.
If there are no recognized variations or corrections, return an empty array for possibleVariations.
The output must be strictly valid JSON without any additional text, markdown formatting, or code blocks.
Examples: 
Input: "cheese" Expected Output: { "isValid": true, "possibleVariations": ["cheddar", "mozzarella", "parmesan"] }

Input: "breakfast" Expected Output: { "isValid": false, "possibleVariations": [] }

Input: "cuscus" Expected Output: { "isValid": false, "possibleVariations": ["couscous"] }`;
    return prompt;
}

export const getRecipeNarrationPrompt = (recipe: ExtendedRecipe) => {
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

${additionalInformation?.tips ? `#### Tips:\n${additionalInformation.tips}\n` : ""}
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

export const getRecipeTaggingPrompt = (recipe: ExtendedRecipe) => {
    const { name, ingredients, dietaryPreference, additionalInformation } = recipe;

    // Extract ingredient names
    const ingredientNames = ingredients.map(ingredient => ingredient.name).join(', ');

    // Extract additional information
    const { tips, variations, servingSuggestions, nutritionalInformation } = additionalInformation;

    // Construct the prompt
    const prompt = `Please generate **10 unique, single-word tags** for the following recipe in a **pure JSON array format**.

**Rules for the response:**
1. The response **must be a valid JSON array** and **must NOT be wrapped in markdown, backticks, or any other formatting**.
2. The array should contain **10 unique, single-word tags** that:
   - **Accurately describe the recipe** based on its name, ingredients, dietary preferences, and additional information.
   - **Are commonly searched terms** for similar recipes.
   - **Include keywords** related to the recipe type, cuisine, or dietary category.
   - **Are concise**, avoiding technical or uncommon terms.

### **Example Valid Response:**
\`["vegetarian", "dessert", "corn", "pudding", "Indian", "sweet", "almond", "cardamom", "saffron", "coconut"]\`

### **Recipe Details:**
- **Recipe Name**: ${name}
- **Main Ingredients**: ${ingredientNames}
- **Dietary Preferences**: ${dietaryPreference.join(', ')}
- **Additional Information**:
  - **Tips**: ${tips}
  - **Variations**: ${variations}
  - **Serving Suggestions**: ${servingSuggestions}
  - **Nutritional Information**: ${nutritionalInformation}`;

    return prompt;
};

export const getChatAssistantSystemPrompt = (recipe: ExtendedRecipe) => {
    const { name, ingredients, instructions, additionalInformation, dietaryPreference } = recipe;
    const systemPrompt = `
You are a helpful recipe assistant. You only respond to questions that are directly related to the following recipe:

Name: ${name}
Ingredients: ${ingredients.map(i => `${i.quantity} ${i.name}`).join(', ')}
Dietary Preferences: ${dietaryPreference.map(p => `${p}`).join(', ')}
Instructions: ${instructions}
Tips: ${additionalInformation.tips}
Variations: ${additionalInformation.variations}
Serving Suggestions: ${additionalInformation.servingSuggestions}
Nutritional Info: ${additionalInformation.nutritionalInformation}

You may provide useful suggestions about ingredient substitutions, dietary modifications, cooking techniques, tools, or serving advice — as long as they apply specifically to this recipe.

If the user asks about anything not related to this recipe — including general cooking topics, science, history, entertainment, or other off-topic subjects — politely decline and guide them back to questions about the recipe: ${name}.
    `.trim();

    return systemPrompt;
}
