import mongoose, { Model }  from 'mongoose';

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

const User: Model<UserType> = mongoose.models.User || mongoose.model<UserType>('User', userSchema);

export default User