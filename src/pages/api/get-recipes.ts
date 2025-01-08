import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../lib/models/recipe';
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
    // Fetch all recipes from the database and populate necessary fields
    const allRecipes = await Recipe.find()
      .populate(['owner', 'likedBy', 'comments.user'])
      .lean()
      .exec() as unknown as ExtendedRecipe[];

    // Filter results based on user session and respond with the filtered recipes
    const filteredRecipes = filterResults(allRecipes, session.user.id);
    res.status(200).json(filteredRecipes);
  } catch (error) {
    // Handle any errors that occur during fetching recipes
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

export default apiMiddleware(['GET'], handler);
