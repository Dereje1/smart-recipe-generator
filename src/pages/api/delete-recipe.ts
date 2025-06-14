import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import recipes from '../../models/recipe';

/**
 * API handler for deleting a recipe.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Validate recipeId from query parameters
        const { recipeId } = req.query;
        if (!recipeId || typeof recipeId !== 'string' || !mongoose.Types.ObjectId.isValid(recipeId)) {
            const error = 'Invalid recipe ID.';
            console.error(error);
            return res.status(400).json({ error });
        }

        // Connect to the database
        await connectDB();

        // Find the recipe by ID
        const recipe = await recipes.findById(recipeId).exec();
        if (!recipe) {
            const error = `Recipe with ID: ${recipeId} not found.`;
            console.error(error);
            return res.status(404).json({ error });
        }

        // Ensure that the user owns the recipe
        if (recipe.owner.toString() !== session.user.id) {
            const error = 'You do not have permission to delete this recipe.';
            console.error(error);
            return res.status(403).json({ error });
        }
        // Delete the recipe
        await recipes.findByIdAndDelete(recipeId).exec();
        console.info(`User ID: ${session.user.id} deleted recipe ID: ${recipeId}`);
        res.status(200).json({ message: `Deleted recipe with ID ${recipeId}` });
    } catch (error) {
        // Handle any errors that occur during fetching recipes
        console.error(error);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
};

export default apiMiddleware(['DELETE'], handler);
