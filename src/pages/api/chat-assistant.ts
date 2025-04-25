import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import aigenerated from '../../models/aigenerated';
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
        // Check if the user has exceeded the API request limit on first entry
        if (history.length === 1) {
            // Count the number of AI-generated entries associated with the user's ID
            const totalGeneratedCount = await aigenerated.countDocuments({ userId: session.user.id }).exec();
            
            if (totalGeneratedCount >= Number(process.env.API_REQUEST_LIMIT)) {
                // If limit is reached, respond with reachedLimit flag and an empty ingredient list
                res.status(200).json({
                    reachedLimit: true,
                });
                return;
            }
        }

        const recipe = await Recipe.findById(recipeId).lean() as unknown as ExtendedRecipe;
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }

        const { reply, totalTokens } = await generateChatResponse(message, recipe, history, session.user.id);
        return res.status(200).json({ reply, totalTokens });
    } catch (err) {
        console.error('Chat Assistant Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default apiMiddleware(['POST'], handler);
