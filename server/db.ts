// server/db.ts
import mongoose from "mongoose";
import { MongoDBStorage } from "./mongodb-storage";
import { config } from "./config";

let mongoStorage: MongoDBStorage;

const connectDB = async () => {
  try {
    // Disable buffering to prevent timeout errors when connection fails
    mongoose.set('bufferCommands', false);
    
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
    });
    
    console.log("✅ MongoDB connected to:", config.mongoUri);
    
    // Initialize MongoDB storage
    mongoStorage = new MongoDBStorage();
    
    // Initialize default assessments and interview guides
    await mongoStorage.initializeDefaultAssessments();
    await mongoStorage.initializeDefaultInterviewGuides();
    
    console.log("✅ MongoDB storage initialized");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    console.log("🔄 Server will continue without database connection");
    console.log("💡 Please check your MongoDB Atlas IP whitelist settings");
    
    // Set mongoose to not buffer commands when disconnected
    mongoose.set('bufferCommands', false);
  }
};

export { mongoStorage };
export default connectDB;
