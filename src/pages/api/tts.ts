import { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import Recipe from '../../models/recipe';
import { uploadAudioToS3 } from '../../lib/awss3';
import { getTTS } from '../../lib/openai'
import { ExtendedRecipe } from '../../types';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { recipeId } = req.body;

  if (!recipeId) {
    return res.status(400).json({ message: 'Missing recipeId' });
  }

  try {
    // Connect to the databaseand Fetch the recipe
    await connectDB();
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // If the audio link already exists, return it
    if (recipe.audio) {
      return res.status(200).json({ audio: recipe.audio });
    }
    
    console.info('Synthesizing text to speech.....')
    const leanRecipe = recipe.toObject() as unknown as ExtendedRecipe;
    const audioBuffer = await getTTS(leanRecipe, session.user.id)
    console.info('Uploading audio to s3....')
    // Upload the audio file to S3
    const s3Url = await uploadAudioToS3({
      audioBuffer, // Buffer from Google TTS API
      fileName: `${recipeId}.mp3`,
    });

    // Update the recipe with the S3 URL
    recipe.audio = s3Url;
    await recipe.save();
    console.info('Saved generated audio to S3')
    // Return the audio URL
    return res.status(200).json({ audio: s3Url });
  } catch (error) {
    console.error('Error handling TTS request:', error);
    return res.status(500).json({ message: 'Error generating or uploading audio' });
  }
}

export default apiMiddleware(['POST'], handler);
