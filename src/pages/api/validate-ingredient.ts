import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { validateIngredient } from '../../lib/openai';
import Ingredient from '../../models/ingredient';
import mongoose from 'mongoose';
import pluralize from 'pluralize';

const MAX_INGREDIENT_NAME_LENGTH = 20;

const normalizeIngredientName = (value: string) => value.trim().toLowerCase();

const parseValidationResponse = (
    response: string | null
): { isValid: boolean; possibleVariations: string[] } | null => {
    if (!response) return null;

    const sanitizedResponse = response
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '');

    try {
        const parsed: unknown = JSON.parse(sanitizedResponse);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        const parsedRecord = parsed as Record<string, unknown>;
        if (typeof parsedRecord.isValid !== 'boolean') return null;

        const possibleVariations = Array.isArray(parsedRecord.possibleVariations)
            ? parsedRecord.possibleVariations.filter((variation: unknown): variation is string => typeof variation === 'string')
            : [];

        return {
            isValid: parsedRecord.isValid,
            possibleVariations
        };
    } catch (error) {
        console.error('Failed to parse OpenAI ingredient validation response', error);
        return null;
    }
};

const isDuplicateIngredient = (ingredientName: string, existingName: string) => {
    const normalizedIngredient = normalizeIngredientName(ingredientName);
    const normalizedExisting = normalizeIngredientName(existingName);

    return (
        normalizedIngredient === normalizedExisting ||
        pluralize.singular(normalizedIngredient) === pluralize.singular(normalizedExisting)
    );
};

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
        const trimmedIngredientName = typeof ingredientName === 'string' ? ingredientName.trim() : '';

        // Validate ingredient name input
        if (!trimmedIngredientName) {
            return res.status(400).json({ error: 'Ingredient name is required' });
        }
        if (trimmedIngredientName.length > MAX_INGREDIENT_NAME_LENGTH) {
            return res.status(400).json({ error: `Ingredient name cannot exceed ${MAX_INGREDIENT_NAME_LENGTH} characters` });
        }

        // Validate ingredient using OpenAI
        console.info('Validating ingredient from OpenAI...');
        const response = await validateIngredient(trimmedIngredientName, userId);
        const parsedResponse = parseValidationResponse(response);

        if (parsedResponse) {
            const formattedIngredientName = trimmedIngredientName[0].toUpperCase() + trimmedIngredientName.slice(1).toLowerCase();
            const allIngredients = await Ingredient.find({}, { name: 1 });
            const ingredientExists = allIngredients.find((ingredient: { name: string }) =>
                isDuplicateIngredient(formattedIngredientName, ingredient.name)
            );

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
