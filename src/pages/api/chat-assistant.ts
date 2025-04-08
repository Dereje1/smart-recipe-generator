import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import { generateChatResponse } from '../../lib/openai';
import { ExtendedRecipe } from '../../types';

/**
 * POST /api/chat-assistant
 * Handles stateless chat queries per recipe context using OpenAI.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        const { message, recipeId, history = [] } = req.body;

        if (!message || !recipeId) {
            return res.status(400).json({ error: 'Message and recipeId are required.' });
        }

        await connectDB();

        const recipe = await Recipe.findById(recipeId).lean() as unknown as ExtendedRecipe;
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }

        const reply = await generateChatResponse(message, recipe, history, session.userId);
        return res.status(200).json({ reply });
    } catch (err) {
        console.error('Chat Assistant Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default apiMiddleware(['POST'], handler);
