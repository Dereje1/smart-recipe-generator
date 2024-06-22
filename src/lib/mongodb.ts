import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

const uri = process.env.MONGO_URI || '';
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGO_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the client is not constantly reinitialized.
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

// Function to connect to MongoDB using Mongoose
const connectDB = async () => {
    if (mongoose.connections[0].readyState) return;

    try {
        await mongoose.connect(uri);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('MongoDB connection failed');
    }
};

// Export a module-scoped MongoClient promise. By doing this in a separate
// module, the client can be shared across functions.
export { clientPromise, connectDB };
