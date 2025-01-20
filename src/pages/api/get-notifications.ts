import type { NextApiRequest, NextApiResponse } from 'next';
import { apiMiddleware } from '../../lib/apiMiddleware';
import Notification from '../../models/notification';
import { connectDB } from '../../lib/mongodb';

/**
 * API handler for fetching notifications for the logged-in user.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse, session: any) => {
    try {
        // Connect to the database
        await connectDB();

        // Fetch notifications for the logged-in user
        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 }) // Sort by most recent
            .lean()
            .exec();

        // Return the notifications
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

export default apiMiddleware(['GET'], handler);
