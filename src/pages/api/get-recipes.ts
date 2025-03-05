import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';
import mongoose from 'mongoose';

/**
 * API handler for fetching paginated and sorted recipes.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
  try {
    // ✅ Connect to the database
    await connectDB();

    // ✅ Extract pagination & sorting parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12; // Default: 12 recipes per page
    const sortOption = req.query.sortOption as string || 'popular'; // Default: `popular`
    const skip = (page - 1) * limit;

    // ✅ Determine sort order
    // 🔹 TODO: `{ likedBy: -1 }` is a temporary workaround.
    // MongoDB does not natively sort arrays. A more robust solution
    // (aggregation pipeline or pre-computed like counts) should be implemented in the future.
    const sortCriteria: Record<string, 1 | -1> = sortOption === 'popular' ? { likedBy: -1 } : { createdAt: -1 };

    // ✅ Get total number of recipes for pagination
    const totalRecipes = await Recipe.countDocuments();

    // ✅ Fetch sorted & paginated recipes using aggregation
    const allRecipes = await Recipe.aggregate([
      {
        $set: { likeCount: { $size: { $ifNull: ["$likedBy", []] } } } // ✅ Compute `likeCount` dynamically
      },
      {
        $sort: sortOption === 'popular' ? { likeCount: -1 } : { createdAt: -1 } // ✅ Sort by likes or creation date
      },
      {
        $skip: skip // ✅ Apply pagination AFTER sorting
      },
      {
        $limit: limit
      },
      {
        $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } // ✅ Fetch owner details
      },
      {
        $lookup: { from: "users", localField: "likedBy", foreignField: "_id", as: "likedBy" } // ✅ Populate likedBy array
      },
      {
        $unwind: "$owner" // ✅ Convert `owner` from an array to a single object
      },
      {
        $lookup: { from: "comments", localField: "comments.user", foreignField: "_id", as: "comments.user" } // ✅ Populate comments with user details
      }
    ]).exec() as unknown as ExtendedRecipe[];

    // ✅ Convert `_id` back to `ObjectId` to prevent breaking `filterResults()`
    const processedRecipes = allRecipes.map(recipe => ({
      ...recipe,
      _id: new mongoose.Types.ObjectId(recipe._id), // ✅ Ensure `_id` is `ObjectId`
      owner: {
        ...recipe.owner,
        _id: new mongoose.Types.ObjectId(recipe.owner._id) // ✅ Ensure `owner._id` is `ObjectId`
      }
    })) as unknown as ExtendedRecipe[];

    // ✅ Filter results based on user session before responding
    const filteredRecipes = filterResults(processedRecipes, session.user.id);

    res.status(200).json({
      recipes: filteredRecipes,
      totalRecipes,
      totalPages: Math.ceil(totalRecipes / limit),
      currentPage: page,
    });

  } catch (error) {
    // 🔴 Handle any errors that occur during fetching recipes
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

// ✅ Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);