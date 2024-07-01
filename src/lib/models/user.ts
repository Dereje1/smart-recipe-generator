import mongoose from 'mongoose';

export interface UserType {
    _id: string,
    name: string,
    email: string,
    image: string,
    emailVerified: string | null,
    createdAt: string,
}

// define the schema for our user model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  emailVerified: String || null,
}, { timestamps: true });

export default mongoose.model<UserType>('User', userSchema);