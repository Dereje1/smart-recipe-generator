import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import aigenerated from '../../models/aigenerated';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for fetching recipes owned or liked by the user.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Convert session user ID to a mongoose ObjectId
        const mongooseUserId = new mongoose.Types.ObjectId(session.user.id);

        // Connect to the database
        await connectDB();

        // Fetch recipes owned or liked by the user
        const profilePins = await Recipe.find({
            $or: [{ owner: mongooseUserId }, { likedBy: mongooseUserId }],
        })
            .populate(['owner', 'likedBy', 'comments.user'])
            .lean()
            .exec() as unknown as ExtendedRecipe[];

        // Count the number of AI-generated entries associated with the user's ID to get overall usage
        const totalGeneratedCount = await aigenerated.countDocuments({ userId: session.user.id }).exec();
        const AIusage = Math.min(Math.round((totalGeneratedCount / Number(process.env.API_REQUEST_LIMIT)) * 100), 100);
        // Filter results based on user session and respond with the filtered recipes
        const filteredRecipes = filterResults(profilePins, session.user.id);
        res.status(200).json({ recipes: filteredRecipes, AIusage });
    } catch (error) {
        // Handle any errors that occur during fetching recipes
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

export default apiMiddleware(['GET'], handler);
