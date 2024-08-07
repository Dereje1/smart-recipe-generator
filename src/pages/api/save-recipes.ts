import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { generateImages } from '../../lib/openai';
import { uploadImagesToS3 } from '../../lib/awss3';
import { authOptions } from '../api/auth/[...nextauth]';
import { getServerSession } from 'next-auth/next';
import { connectDB } from '../../lib/mongodb';
import recipe from '../../lib/models/recipe';
import { Recipe, UploadReturnType } from '../../types';

/**
 * Helper function to get the S3 link for an uploaded image.
 * @param uploadResults - The results of the S3 upload operation.
 * @param location - The location identifier for the image.
 * @returns The URL of the image in S3 or a fallback image URL.
 */
const getS3Link = (uploadResults: UploadReturnType[] | null, location: string) => {
    const fallbackImg = '/logo.svg';
    if (!uploadResults) return fallbackImg;
    const filteredResult = uploadResults.filter(result => result.location === location);
    if (filteredResult[0]?.uploaded) {
        return `https://smart-recipe-generator.s3.amazonaws.com/${location}`;
    }
    return fallbackImg;
};

/**
 * API handler for generating images for recipes, uploading them to S3, and saving the recipes to MongoDB.
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

        // Extract recipes from the request body
        const { recipes } = req.body;
        const recipeNames = recipes.map(({ name, ingredients }: Recipe) => ({ name, ingredients }));

        // Generate images using OpenAI
        console.info('Getting images from OpenAI...');
        const imageResults = await generateImages(recipeNames, session.user.id);
        
        // Prepare images for uploading to S3
        const openaiImagesArray = imageResults.map((result, idx) => ({
            originalImgLink: result.imgLink,
            userId: session.user.id,
            location: recipes[idx].openaiPromptId
        }));

        // Upload images to S3
        console.info('Uploading OpenAI images to S3...');
        const uploadResults = await uploadImagesToS3(openaiImagesArray);

        // Update recipe data with image links and owner information
        const updatedRecipes = recipes.map((r: Recipe) => ({
            ...r,
            owner: new mongoose.Types.ObjectId(session.user.id),
            imgLink: getS3Link(uploadResults, r.openaiPromptId),
            openaiPromptId: r.openaiPromptId.split('-')[0] // Remove client key iteration
        }));

        // Connect to MongoDB and save recipes
        await connectDB();
        await recipe.insertMany(updatedRecipes);
        console.info(`Successfully saved ${recipes.length} recipes to MongoDB`);

        // Respond with success message
        res.status(200).json({ status: 'Saved Recipes and generated the Images!' });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Failed to send response:', error);
        res.status(500).json({ error: 'Failed to save recipes' });
    }
};

export default handler;
