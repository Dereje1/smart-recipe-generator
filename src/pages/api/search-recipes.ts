import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import Recipe from '../../models/recipe';
import { connectDB } from '../../lib/mongodb';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for searching recipes (currently only by tags).
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { query, page = 1, limit = 12 } = req.query;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({ error: 'Search query (tag) is required' });
        }

        // Convert pagination values to numbers
        const pageNumber = Number(page);
        const limitNumber = Number(limit);
        const skip = (pageNumber - 1) * limitNumber; // Calculate pagination offset

        // Connect to the database
        await connectDB();

        // Execute both queries in parallel for efficiency
        const [recipes, popularTags, totalRecipes] = await Promise.all([
            // 🔹 Fetch paginated search results
            Recipe.find({ "tags.tag": { $regex: `\\b${query}.*`, $options: "i" } })
                .populate(['owner', 'likedBy', 'comments.user'])
                .skip(skip)
                .limit(limitNumber)
                .lean() as unknown as ExtendedRecipe[],

            // 🔹 Fetch `popularTags` from the ENTIRE collection (not just filtered results)
            Recipe.aggregate([
                { $unwind: "$tags" },
                { $unwind: "$tags.tag" },
                { $group: { _id: "$tags.tag", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]),

            // 🔹 Get total matching recipes (for pagination)
            Recipe.countDocuments({ "tags.tag": { $regex: `\\b${query}.*`, $options: "i" } }),
        ]);

        return res.status(200).json({
            recipes: filterResults(recipes, session.user.id),
            totalRecipes,
            totalPages: Math.ceil(totalRecipes / limitNumber),
            currentPage: pageNumber,
            popularTags, // ✅ Ensures consistent tag data across requests
        });

    } catch (error) {
        console.error('Error searching recipes by tags:', error);
        return res.status(500).json({ error: 'Failed to fetch search results' });
    }
};

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);
