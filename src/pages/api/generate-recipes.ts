import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { generateRecipe } from '../../lib/openai';

/**
 * API handler for generating recipes based on provided ingredients and dietary preferences.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Only allow POST requests
        if (req.method !== 'POST') {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }

        // Get the user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: 'You must be logged in.' });
        }

        // Extract ingredients and dietary preferences from request body
        const { ingredients, dietaryPreferences } = req.body;

        // Validate ingredients input
        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        // Generate recipes using OpenAI API
        console.info('Generating recipes from OpenAI...');
        const response = await generateRecipe(ingredients, dietaryPreferences, session.user.id);

        // Respond with the generated recipes
        res.status(200).json(response);
    } catch (error) {
        // Handle any errors that occur during recipe generation
        console.error(error);
        res.status(500).json({ error: 'Failed to generate recipes' });
    }
};

export default handler;
