import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';
import Ingredient from '../../lib/models/ingredient';
import { IngredientDocumentType } from '../../types';

type Data = IngredientDocumentType[] | {
    error: string
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    try {
        await connectDB();
        const allIngredients = await Ingredient.find().sort({ name: 1 }).exec() as unknown as IngredientDocumentType[];
        res.status(200).json(allIngredients);
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch ingredients' });
    }
}