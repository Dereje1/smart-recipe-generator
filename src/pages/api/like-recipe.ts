import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]";
import { connectDB } from '../../lib/mongodb';
import recipes from '../../lib/models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

const toggleLike = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Only allow PUT requests
        if (req.method !== 'PUT') {
            res.setHeader('Allow', ['PUT']);
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }

        // Get the user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: "You must be logged in." });
        }

        // Validate recipeId
        const { recipeId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ error: "Invalid recipe ID" });
        }

        // Connect to the database
        await connectDB();
        
        // Find the recipe by ID
        const recipe = await recipes.findById(recipeId).exec();
        if (!recipe) {
            res.end(`Recipe with Id: ${recipeId} not found... exiting`);
            return;
        }

        // Toggle the like status
        const liked = recipe.likedBy.some((r) => r.toString() === session.user.id);
        const update = liked
            ? { $pull: { likedBy: new mongoose.Types.ObjectId(session.user.id) } }
            : { $addToSet: { likedBy: new mongoose.Types.ObjectId(session.user.id) } };

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
};

export default toggleLike;