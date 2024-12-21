import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import Notification from '../../lib/models/notification';
import { connectDB } from '../../lib/mongodb';

/**
 * API handler for marking a notification as read for the logged-in user.
 * @param req - The Next.js API request object.
 * @param res - The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        // Only allow PUT requests
        if (req.method !== 'PUT') {
            res.setHeader('Allow', ['PUT']);
            return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
        
        // Get the user session
        const session = await getServerSession(req, res, authOptions);
        if (!session) {
            return res.status(401).json({ error: 'You must be logged in.' });
        }

        // Extract notification ID from the request query
        const { id } = req.query;
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid notification ID' });
        }
  
        // Connect to the database
        await connectDB();

        // Find and update the notification for the logged-in user
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Return the updated notification
        res.status(200).json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

export default handler;
