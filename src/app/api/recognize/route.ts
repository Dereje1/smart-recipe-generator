import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
            {
              type: 'text',
              text: 'Look at this image and list all the food ingredients you can see. Return ONLY a JSON array of ingredient names in English, nothing else. Example: ["tomato", "onion", "garlic"]',
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const content = response.choices[0].message.content || '[]';
    const ingredients = JSON.parse(content);

    return NextResponse.json({ ingredients });
  } catch (error) {
    console.error('Recognition error:', error);
    return NextResponse.json({ error: 'Failed to recognize ingredients' }, { status: 500 });
  }
}