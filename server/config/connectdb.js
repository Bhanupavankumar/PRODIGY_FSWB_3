// ./config/connectdb.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  const primary = process.env.MONGODB_URI;
  const fallback = process.env.MONGODB_URI_FALLBACK || 'mongodb://127.0.0.1:27017/hackerhon';

  // Try primary connection first
  try {
    await mongoose.connect(primary);
    console.log("MongoDB connected successfully (primary)!");
    return;
  } catch (errPrimary) {
    console.error("Primary MongoDB connection failed:", errPrimary.message || errPrimary);

    // If fallback explicitly provided or local fallback is acceptable, try it
    if (fallback && fallback !== primary) {
      try {
        console.log(`Attempting fallback MongoDB URI: ${fallback}`);
        await mongoose.connect(fallback);
        console.log("MongoDB connected successfully (fallback)!");
        return;
      } catch (errFallback) {
        console.error("Fallback MongoDB connection failed:", errFallback.message || errFallback);
      }
    }

    // Provide actionable guidance for Atlas SRV errors
    console.error(`
MongoDB connection failed. Common causes:
 - Incorrect SRV host (cluster name) in MONGODB_URI
 - Your machine IP isn't whitelisted in Atlas Network Access
 - DNS resolution for SRV records is blocked on the network

Suggested actions:
 - Verify MONGODB_URI is correct and uses the right cluster host
 - Add your IP to Atlas IP Access List or allow 0.0.0.0/0 for testing
 - If SRV lookups are blocked, set an explicit MONGODB_URI_FALLBACK to a standard URI (mongodb://127.0.0.1:27017/yourdb) in your .env
`);

    // Do not throw — return false so the caller can decide to run in degraded mode.
    return false;
  }
};

export default connectDB;
