export type Ingredient = {
    name: string
    quantity: number | null
    id: number
}

// Type for dietary preferences
export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Keto' | 'Paleo';

interface RecipeIngredient {
    name: string;
    quantity: string;
}

interface AdditionalInformation {
    tips: string;
    variations: string;
    servingSuggestions: string;
    nutritionalInformation: string;
}

export interface Recipe {
    name: string;
    ingredients: RecipeIngredient[];
    instructions: string[];
    dietaryPreference: string[];
    additionalInformation: AdditionalInformation;
    id: string
}