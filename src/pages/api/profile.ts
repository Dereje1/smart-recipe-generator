import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../lib/models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for fetching recipes owned or liked by the user.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Only allow GET requests
        if (req.method !== 'GET') {
            res.setHeader('Allow', ['GET']);
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }

        // Get the user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: 'You must be logged in.' });
        }

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

        // Filter results based on user session and respond with the filtered recipes
        const filteredRecipes = filterResults(profilePins, session.user.id);
        res.status(200).json(filteredRecipes);
    } catch (error) {
        // Handle any errors that occur during fetching recipes
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
};

export default handler;
