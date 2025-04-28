// /pages/api/get-user-activity.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import mongoose from 'mongoose';
import Recipe from '../../models/recipe';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for fetching user activity (created and liked recipes).
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    const { userId } = req.query;

    // validate query
    if (!userId || typeof userId != 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ error: 'Invalid user ID' });
    }
    try {
        await connectDB();

        const createdRecipes = await Recipe.find({ owner: userId })
            .sort({ createdAt: -1 })
            .lean() as unknown as ExtendedRecipe[];

        const likedRecipes = await Recipe.find({ likedBy: userId })
            .sort({ createdAt: -1 })
            .lean() as unknown as ExtendedRecipe[];

        return res.status(200).json({
            createdRecipes: filterResults(createdRecipes, session.user.id),
            likedRecipes: filterResults(likedRecipes, session.user.id),
        });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);