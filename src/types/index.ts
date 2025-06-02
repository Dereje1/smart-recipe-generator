import mongoose from 'mongoose';

export type Ingredient = {
    name: string
    quantity?: number | null
    id: string
}

// Type for dietary preferences in client
export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Keto' | 'Dairy-Free' | 'Halal' | 'Kosher';

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
    openaiPromptId: string
}

// this is for raw recipe documents to be stored in the db
interface tagType {
    _id: string,
    tag: string,
}

interface unPopulatedComment {
    _id: mongoose.Types.ObjectId,
    user: mongoose.Types.ObjectId,
    comment: string,
    createdAt: string,
}


export interface RecipeDocument extends Recipe {
    owner: mongoose.Types.ObjectId
    imgLink: string
    likedBy: mongoose.Types.ObjectId[]
    comments: unPopulatedComment[],
    createdAt: string,
    tags: tagType[],
    audio?: string
}

// this is for recipes returned from the db back to the client or those returned from populated mongoose queries
export interface ExtendedRecipe extends Recipe {
    _id: string
    imgLink: string
    owner: {
        _id: string
        name: string
        image: string
    }
    createdAt: string
    updatedAt: string
    likedBy: {
        _id: string
        name: string
        image: string
    }[]
    owns: boolean
    liked: boolean
    audio?: string
    tags: tagType[]
}

export interface IngredientDocumentType {
    _id: string,
    name: string,
    createdBy: string | null,
    createdAt: string,
}

export interface UploadReturnType {
    location: string,
    uploaded: boolean
}

// Define the interface for the Notification model
export interface NotificationType {
    _id: string;
    userId: mongoose.Schema.Types.ObjectId; // Reference to the recipient (owner of the recipe)
    initiatorId: mongoose.Schema.Types.ObjectId; // Reference to the user who performed the action (e.g., liked the recipe)
    type: 'like' | 'comment' | 'update'; // Type of notification
    recipeId: mongoose.Schema.Types.ObjectId; // Reference to the recipe related to the notification
    message: string; // Message displayed in the notification
    read: boolean; // Whether the notification has been read
    createdAt: string; // Auto-generated timestamp
    updatedAt: string; // Auto-generated timestamp
}

export interface PaginationQueryType {
    page?: string,
    limit?: string,
    sortOption?: string,
    query?: string
}