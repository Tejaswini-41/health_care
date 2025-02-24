import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // Drop existing collection and indexes
        try {
            await mongoose.connection.collection('users').drop();
        } catch (error) {
            console.log('Collection does not exist yet');
        }
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;