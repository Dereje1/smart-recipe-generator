import mongoose, { Model }  from 'mongoose';
import User from './user';
import { IngredientDocumentType } from '../types';


// define the schema for our user model
const ingredientSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      unique: true, // Ensure ingredient names are unique
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User, // Reference to the User model (if applicable)
      default: null, // Default to null for pre-defined ingredients
    }
  }, { timestamps: true });
  
  const Ingredient: Model<IngredientDocumentType> = mongoose.models.Ingredient || mongoose.model<IngredientDocumentType>('Ingredient', ingredientSchema);

  export default Ingredient;