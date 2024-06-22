import mongoose from 'mongoose';

const connectDB = async () => {
    console.log(process.env.MONGO_URI)
    if (mongoose.connections[0].readyState) return;

    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB Connected');
};

export default connectDB;
