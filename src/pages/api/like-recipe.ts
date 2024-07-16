import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { connectDB } from '../../lib/mongodb';
import recipes from '../../lib/models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

const toggleLike = async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the user session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        res.status(401).json({ message: "You must be logged in." });
        return;
    }

    // Only allow PUT requests
    if (req.method === 'PUT') {
        // Extract recipeId from the request body
        const { recipeId } = req.body;
        
        // Connect to the database
        await connectDB();

        try {
            // Find the recipe by ID
            const recipe = await recipes.findById(recipeId).exec();
            if (!recipe) {
                res.end(`Recipe with Id: ${recipeId} not found... exiting`);
                return;
            }

            // Check if the user has already liked the recipe
            const liked = recipe.likedBy.some((r) => r.toString() === session.user.id);
            let update;

            if (!liked) {
                // Add the user's like
                update = { $set: { likedBy: [...recipe.likedBy, new mongoose.Types.ObjectId(session.user.id)] } };
            } else {
                // Remove the user's like
                const removedLike = recipe.likedBy.filter((r) => r.toString() !== session.user.id);
                update = { $set: { likedBy: removedLike } };
            }

            // Update the recipe with the new likes array
            const updatedRecipe = await recipes.findByIdAndUpdate(recipeId, update, { new: true })
                .populate(['owner', 'likedBy', 'comments.user'])
                .lean()
                .exec() as unknown as ExtendedRecipe;

            if (!updatedRecipe) {
                res.end(`Recipe with Id: ${recipeId} unable to return document.. exiting`);
                return;
            }

            // Filter and update the recipe data
            const [filteredAndUpdatedRecipe] = filterResults([updatedRecipe], session.user.id);
            res.status(200).json(filteredAndUpdatedRecipe);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to like recipe' });
        }
    } else {
        // Handle invalid request methods
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default toggleLike;