import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
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
    // Connect to the database
    await connectDB();

    // ✅ Step 2: Get `page` and `limit` from query params (with defaults)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12; // Default to 12 recipes per request
    const sortOption = req.query.sortOption as string || 'popular'; // ✅ Get `sortOption`, default to 'popular'
    const skip = (page - 1) * limit;

    // ✅ Determine sort order
    // 🔹 TODO: MongoDB does not natively sort arrays like `{ likedBy: -1 }`.
    // This currently works but is not ideal. We need a more robust approach,
    // such as using an aggregation pipeline or pre-computed like counts.
    const sortCriteria: Record<string, 1 | -1> = sortOption === 'popular' ? { likedBy: -1 } : { createdAt: -1 };

    // ✅ Step 2: Get total number of recipes
    const totalRecipes = await Recipe.countDocuments();
    // ✅ Step 2: Fetch paginated recipes
    const allRecipes = await Recipe.find()
      .populate(['owner', 'likedBy', 'comments.user'])
      .sort(sortCriteria) // Show latest recipes first
      .skip(skip)
      .limit(limit)
      .lean() as unknown as ExtendedRecipe[];

    // Filter results based on user session and respond with the filtered recipes
    const filteredRecipes = filterResults(allRecipes, session.user.id);
    res.status(200).json({
      recipes: filteredRecipes,
      totalRecipes,
      totalPages: Math.ceil(totalRecipes / limit),
      currentPage: page,
    });
  } catch (error) {
    // Handle any errors that occur during fetching recipes
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

export default apiMiddleware(['GET'], handler);