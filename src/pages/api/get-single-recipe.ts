import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import mongoose from 'mongoose';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for fetching all recipes.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { recipeId } = req.query;
        // validate query
        if (!recipeId || typeof recipeId != 'string' || !mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(401).json({ error: 'Invalid recipe ID' });
        }
        // Connect to the database
        await connectDB();

        // Find the recipe by ID
        const recipe = await Recipe.findById(recipeId)
            .populate(['owner', 'likedBy', 'comments.user'])
            .lean()
            .exec() as unknown as ExtendedRecipe;

        if (!recipe) {
            return res.status(404).json({ error: `Recipe with Id: ${recipeId} not found... exiting` });
        }

        // Filter result based on user session and respond with the filtered recipe
        const [filteredRecipe] = filterResults([recipe], session.user.id);
        res.status(200).json(filteredRecipe);
    } catch (error) {
        // Handle any errors that occur during fetching recipes
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
};

export default apiMiddleware(['GET'], handler);
