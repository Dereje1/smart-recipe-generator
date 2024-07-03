import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../lib/models/recipe';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectDB();
  try {
    const recipes = await Recipe.find(); // Fetch all recipes
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

export default handler;
