import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../lib/models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

/**
 * API handler for fetching all recipes.
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

export default handler;
