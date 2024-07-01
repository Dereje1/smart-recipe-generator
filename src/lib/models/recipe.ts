import mongoose, { Model }  from 'mongoose';
import { Recipe as RecipeType } from '../../types/index'


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

interface RecipeDocument extends RecipeType {
    owner: mongoose.Types.ObjectId
    imgLink: string
    likedBy: mongoose.Types.ObjectId[]
    comments: unPopulatedComment[],
    createdAt: string,
    tags: tagType[],
}

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: { type: String, required: true },
}, {
    timestamps: true,
});

const tagSchema = new mongoose.Schema({
    tag: { type: String, required: true },
});

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: String || undefined, required: true },
});

const recipeSchema = new mongoose.Schema({
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    ingredients: [ingredientSchema],
    instructions: [{ type: String, required: true }],
    dietaryPreference: [{ type: String, required: true }],
    additionalInformation:{
        tips: { type: String, required: true },
        variations: { type: String, required: true },
        servingSuggestions: { type: String, required: true },
        nutritionalInformation: { type: String, required: true },
    },
    imgLink: { type: String },
    openaiPromptId: {type: String, required: true},
    likedBy: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
    comments: {
        type: [commentSchema],
        default: [],
    },
    tags: {
        type: [tagSchema],
        default: [],
    },
}, { timestamps: true });

const Recipe: Model<RecipeDocument> = mongoose.models.Recipe || mongoose.model<RecipeDocument>('Recipe', recipeSchema);

export default Recipe;