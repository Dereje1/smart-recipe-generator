import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from "../api/auth/[...nextauth]"
import { getServerSession } from "next-auth/next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
        res.status(401).json({ message: "You must be logged in." })
        return
    }

    if (req.method === 'POST') {
        const { ingredientName } = req.body;

        if (!ingredientName) {
            return res.status(400).json({ error: 'Ingredients are required' });
        }

        try {
            console.log('Validating ingredient from openAI...')
            const response = await Promise.resolve({ isValid: true, ingredientName });
            res.status(200).json(response);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate recipe' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
};

export default handler;
