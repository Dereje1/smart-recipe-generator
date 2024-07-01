import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { generateRecipe } from '../../lib/openai';
import stub from '../components/Recipe_Creation/stub_response.json';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ message: "You must be logged in." })
    return
  }

  if (req.method === 'POST') {
    const { ingredients, dietaryPreferences } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    try {
      const response = await generateRecipe(ingredients, dietaryPreferences, session.user.id);
      // const response = { recipes: stub, openaiPromptId: Date.now() }
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
