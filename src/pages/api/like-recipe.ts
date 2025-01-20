import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import recipes from '../../models/recipe';
import notifications from '../../models/notification';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

const toggleLike = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
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
        const liked = recipe.likedBy.some((r: mongoose.Types.ObjectId) => r.toString() === session.user.id);
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
        /* 
           Ensure a notification is created only on the first like and not duplicated on repeated likes.
           If a matching notification already exists (same user, recipe, and type), do nothing.
           If no matching notification exists, insert a new one with the specified message and `read: false`.
        */
        if (!liked) {
            await notifications.findOneAndUpdate(
                {
                    userId: recipe.owner, // The owner of the recipe receives the notification
                    initiatorId: session.user.id, // The user who liked the recipe
                    type: 'like',
                    recipeId: recipeId, // The recipe being liked
                },
                {
                    $setOnInsert: {
                        message: `${session.user.name} liked your recipe: "${recipe.name}"`,
                        read: false,
                    }
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }



        // Filter and update the recipe data
        const [filteredAndUpdatedRecipe] = filterResults([updatedRecipe], session.user.id);
        res.status(200).json(filteredAndUpdatedRecipe);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to like recipe' });
    }
};

export default apiMiddleware(['PUT'], toggleLike);