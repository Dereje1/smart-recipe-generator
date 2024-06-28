export type Ingredient = {
    name: string
    quantity: number | null
    id: number
}

// Type for dietary preferences
export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Keto' | 'Paleo';