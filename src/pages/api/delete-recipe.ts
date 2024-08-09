import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { connectDB } from '../../lib/mongodb';
import recipes from '../../lib/models/recipe';

/**
 * API handler for deleting a recipe.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Only allow GET requests
        if (req.method !== 'DELETE') {
            res.setHeader('Allow', ['DELETE']);
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }

        // Get the user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            const error = 'You must be logged in.'
            console.error(error)
            return res.status(401).json({ error });
        }

        // Validate recipeId
        const { recipeId } = req.body;
        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            const error = "Invalid recipe ID"
            console.error(error)
            return res.status(400).json({ error });
        }

        // Connect to the database
        await connectDB();

        // Find the recipe by ID
        const recipe = await recipes.findById(recipeId).exec();
        if (!recipe) {
            const error = `Recipe with Id: ${recipeId} not found... exiting DELETE`
            console.error(error)
            return res.status(400).json({ error  });
        }

        // Ensure that the user owns the recipe
        if (session.user.id !== recipe.owner.toString()) {
            const error = `Recipe with Id: ${recipeId} is not owned by userId: ${session.user.id}... exiting DELETE`
            console.error(error)
            return res.status(400).json({ error });
        }
        // Delete the recipe
        await recipes.findByIdAndDelete(recipeId).exec();
        console.info(`User id: ${session.user.id} deleted recipe id:${recipeId}`)
        res.status(200).json({ message: `Deleted recipe with id ${recipeId}` });
    } catch (error) {
        // Handle any errors that occur during fetching recipes
        console.error(error);
        res.status(500).json({ error: 'Failed to delete recipe' });
    }
};

export default handler;
