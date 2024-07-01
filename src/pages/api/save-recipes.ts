import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { connectDB } from '../../lib/mongodb';
import recipe from '../../lib/models/recipe';
import { Recipe } from '../../types';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ message: "You must be logged in." })
    return
  }

  if (req.method === 'POST') {
    const { recipes } = req.body;
    const updatedRecipes = recipes.map((r: Recipe) => ({
        ...r,
        owner: new mongoose.Types.ObjectId(session.user.id),
        imgLink: 'To be determined',
        openaiPromptId: r.openaiPromptId.split('-')[0] // take out client key iteration
    }) )
    await connectDB()
    await recipe.insertMany(updatedRecipes);
    try {
      res.status(200).json({ status: 'Saved to DB!' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
