import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import { filterResults, paginationQueryHelper } from '../../utils/utils';
import { ExtendedRecipe, PaginationQueryType } from '../../types';
import { PipelineStage } from 'mongoose';

const aggreagteHelper = (sortOption: string, skip: number, limit: number): PipelineStage[] => {
  const base: PipelineStage[] = [
    { $skip: skip }, // Apply pagination AFTER sorting
    { $limit: limit },
    { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "owner" } }, // Fetch owner details
    { $lookup: { from: "users", localField: "likedBy", foreignField: "_id", as: "likedBy" } }, // Populate likedBy array
    { $unwind: "$owner" }, // Convert `owner` from an array to a single object
    { $lookup: { from: "comments", localField: "comments.user", foreignField: "_id", as: "comments.user" } } // Populate comments with user details
  ];

  if (sortOption === 'popular') {
    return [
      { $set: { likeCount: { $size: { $ifNull: ["$likedBy", []] } } } },  // Compute `likeCount` dynamically
      { $sort: { likeCount: -1, _id: 1 } },
      ...base
    ];
  }

  return [
    { $sort: { createdAt: -1, _id: -1 } }, // Sort by creation date, field already exists no need for $set
    ...base
  ];
};

/**
 * API handler for fetching paginated and sorted recipes.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 * @param session - The user session from `apiMiddleware`.
 */

const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
  try {
    // Connect to the database
    await connectDB();

    const { page, limit, sortOption, skip } = paginationQueryHelper(req.query as unknown as PaginationQueryType)
    // Execute all queries in parallel using Promise.all()
    const [allRecipes, popularTags, totalRecipes] = await Promise.all([
      // Query 1: Fetch sorted & paginated recipes
      Recipe.aggregate(aggreagteHelper(sortOption, skip, limit)) as unknown as ExtendedRecipe[],

      // Query 2: Compute the most common tags from `tags.tags`
      Recipe.aggregate([
        { $unwind: "$tags" }, // Unwind `tags` sub-document first
        { $unwind: "$tags.tag" }, // Then unwind `tags.tags` array inside it
        { $group: { _id: "$tags.tag", count: { $sum: 1 } } }, // Count occurrences of each tag
        { $sort: { count: -1 } }, // Sort tags by frequency (descending)
        { $limit: 20 } // Get the top 20 most popular tags
      ]),

      // Query 3: Get total number of recipes for pagination
      Recipe.countDocuments()
    ]);

    // Filter results based on user session before responding
    const filteredRecipes = filterResults(allRecipes, session.user.id);

    res.status(200).json({
      recipes: filteredRecipes,
      totalRecipes,
      totalPages: Math.ceil(totalRecipes / limit),
      currentPage: page,
      popularTags
    });

  } catch (error) {
    // 🔴 Handle any errors that occur during fetching recipes
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

// Apply middleware for authentication & allowed methods
export default apiMiddleware(['GET'], handler);