import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { validateIngredient } from '../../lib/openai';
import Ingredient from '../../models/ingredient';
import mongoose from 'mongoose';

/**
 * API handler for validating and adding a new ingredient.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Extract ingredient name from the request body
        const { ingredientName } = req.body;
        const userId = session.user.id;

        // Validate ingredient name input
        if (!ingredientName) {
            return res.status(400).json({ error: 'Ingredient name is required' });
        }

        // Validate ingredient using OpenAI
        console.info('Validating ingredient from OpenAI...');
        const response = await validateIngredient(ingredientName, userId);
        const parsedResponse = response ? JSON.parse(response) : null;

        if (parsedResponse) {
            const formattedIngredientName = ingredientName[0].toUpperCase() + ingredientName.slice(1).toLowerCase();
            const ingredientExists = await Ingredient.findOne({ name: formattedIngredientName });

            if (parsedResponse.isValid) {
                if (!ingredientExists) {
                    // Create new ingredient if it does not exist
                    const newIngredient = await Ingredient.create({
                        name: formattedIngredientName,
                        createdBy: new mongoose.Types.ObjectId(userId)
                    });
                    return res.status(200).json({
                        message: 'Success',
                        newIngredient,
                        suggested: parsedResponse.possibleVariations
                    });
                } else {
                    // Respond with error if ingredient already exists
                    return res.status(200).json({
                        message: 'Error: This ingredient already exists'
                    });
                }
            } else {
                // Respond with invalid ingredient and possible variations
                return res.status(200).json({
                    message: 'Invalid',
                    suggested: parsedResponse.possibleVariations
                });
            }
        } else {
            // Handle error in parsing response
            return res.status(200).json({
                message: 'Error with parsing response'
            });
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        return res.status(500).json({ error: 'Failed to add ingredient' });
    }
};

export default apiMiddleware(['POST'], handler);
