import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from "../api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../lib/models/recipe';
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Get the user session
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).json({ message: "You must be logged in." });
    return;
  }
  await connectDB();
  try {
    const allRecipes = await Recipe.find()
      .populate(['owner', 'likedBy', 'comments.user'])
      .lean()
      .exec() as unknown as ExtendedRecipe[]

    res.status(200).json(filterResults(allRecipes));
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
};

export default handler;
