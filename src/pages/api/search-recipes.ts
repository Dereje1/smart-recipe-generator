import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import Recipe from '../../models/recipe';
import { connectDB } from '../../lib/mongodb';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for searching rescipes (currently only by tags).
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { query, limit = 100 } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query (tag) is required' });
        }
        // Connect to the database
        await connectDB();

        const recipes = await Recipe.find({
            "tags.tag": { $regex: query, $options: 'i' } // Search within the tags array
        })
        .populate(['owner', 'likedBy', 'comments.user'])
        .limit(Number(limit)) // Limit the number of results
        .lean() as unknown as ExtendedRecipe[];

        return res.status(200).json(filterResults(recipes,session.user.id) );
    } catch (error) {
        console.error('Error searching recipes by tags:', error);
        return res.status(500).json({ error: 'Failed to fetch search results' });
    }
};

export default apiMiddleware(['GET'], handler);
