import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"
import { validateIngredient } from '../../lib/openai';
import Ingredient from '../../lib/models/ingredient';
import mongoose from 'mongoose';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(401).json({ message: "You must be logged in." });
    }

    if (req.method === 'POST') {
        const { ingredientName } = req.body;
        const userId = session.user.id;

        if (!ingredientName) {
            return res.status(400).json({ message: 'Ingredient name is required' });
        }

        try {
            console.log('Validating ingredient from OpenAI...');
            const response = await validateIngredient(ingredientName, userId);
            const parsedResponse = response ? JSON.parse(response) : null;

            if (parsedResponse) {
                const formattedIngredientName = ingredientName[0].toUpperCase() + ingredientName.slice(1).toLowerCase();
                const ingredientExists = await Ingredient.findOne({ name: formattedIngredientName });

                if (parsedResponse.isValid) {
                    if (!ingredientExists) {
                        const newIngredient = await Ingredient.create({
                            name: formattedIngredientName,
                            createdBy: new mongoose.Types.ObjectId(userId)
                        });
                        return res.status(200).json({
                            message: 'Success',
                            newIngredient
                        });
                    } else {
                        return res.status(200).json({
                            message: 'Error: This ingredient already exists'
                        });
                    }
                } else {
                    return res.status(200).json({
                        message: 'Invalid',
                        suggested: parsedResponse.possibleVariations
                    });
                }
            } else {
                return res.status(200).json({
                    message: 'Error with parsing response'
                });
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to add ingredient' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default handler;
