import type { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '../../lib/mongodb';

type Data = {
    message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    try {
        await connectDB();
        res.status(200).json({ message: 'Database connected successfully' });
    } catch (error) {
        console.dir({ error })
        res.status(500).json({ message: 'Database connection failed' });
    }
}
