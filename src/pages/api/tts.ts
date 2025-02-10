import { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { connectDB } from '../../lib/mongodb';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import Recipe from '../../models/recipe';
import { uploadAudioToS3 } from '../../lib/awss3';
import { getTTS } from '../../lib/openai'
import { filterResults } from '../../utils/utils';
import { ExtendedRecipe } from '../../types';

async function handler(req: NextApiRequest, res: NextApiResponse, session: any) {
  const { recipeId, text } = req.body;

  if (!recipeId || !text) {
    return res.status(400).json({ message: 'Missing recipeId or text' });
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
    /*
        const client = new TextToSpeechClient({
          credentials: JSON.parse(
            Buffer.from(process.env.GOOGLE_SERVICE_KEY_BASE64 || '', 'base64').toString('utf-8')
          ),
        });
    
        console.info('Synthesizing text to speech.....')
        // Synthesize speech using Google TTS
        type ssmlGenderType = 'FEMALE' | 'MALE'
        const voiceChoices: ssmlGenderType[] = ['FEMALE', 'MALE'];
        const ssmlGender = voiceChoices[Math.floor(Math.random() * voiceChoices.length)]
        const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
          input: { text },
          voice: { languageCode: 'en-US', ssmlGender },
          audioConfig: { audioEncoding: 'MP3' },
        };
    
        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent;
        if (!audioContent) {
          throw new Error('Audio content is empty');
        }
        */
    // Filter result based on user session and respond with the filtered recipe
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
