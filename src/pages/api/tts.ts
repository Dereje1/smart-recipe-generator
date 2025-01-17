import { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';

async function handler(req: NextApiRequest, res: NextApiResponse) {

  const client = new TextToSpeechClient({
    keyFilename: 'google-key.json', // Adjust path to match your setup
  });

  const { text } = req.body;

  const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
    input: { text },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  try {
    // Await the promise and destructure the result
    const [response] = await client.synthesizeSpeech(request);

    // Convert audioContent to a base64 string using Buffer
    const base64Audio = response.audioContent
      ? Buffer.from(response.audioContent).toString('base64')
      : '';

    res.status(200).json({ audio: base64Audio });
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ message: 'Error generating audio' });
  }
}

export default apiMiddleware(['POST'], handler);