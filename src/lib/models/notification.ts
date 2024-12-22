import mongoose, { Model, Schema } from 'mongoose';
import User from './user'; // Import the User model
import { NotificationType } from '../../types';



// Define the schema for the Notification model
const notificationSchema = new mongoose.Schema<NotificationType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User, // Reference to the User model
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'update'],
      required: true,
    },
    recipeId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt`
);

// Create the Notification model
const Notification: Model<NotificationType> =
  mongoose.models.Notification || mongoose.model<NotificationType>('Notification', notificationSchema);

export default Notification;
