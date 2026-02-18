import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // The error from the initial log shows a DNS resolution problem.
        // This console.error will provide more specific details from Mongoose.
        console.error(`MongoDB connection error: ${error.message}`);
        throw error; // Re-throw the error to be caught by the caller in index.js
    }
};

export default connectDB;