import type { NextApiRequest, NextApiResponse } from 'next';
// import { generateRecipe } from '../../../lib/openai';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { ingredients, dietaryPreferences } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients are required' });
    }

    try {
      // const recipe = await generateRecipe(ingredients, dietaryPreferences);
      res.status(200).json({ ingredients, dietaryPreferences });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate recipe' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
