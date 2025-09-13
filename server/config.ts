// server/config.ts
export const config = {
  // MongoDB Configuration
  mongoUri: process.env.MONGO_URI || "mongodb+srv://admin:admin@alumniconnect.ovcbqxq.mongodb.net/alumniconnect?retryWrites=true&w=majority&appName=AlumniConnect",
  
  // Session Configuration
  sessionSecret: process.env.SESSION_SECRET || "your-super-secret-session-key-here",
  
  // Server Configuration
  port: parseInt(process.env.PORT || '8080', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Atlas (cloud) example:
  // mongoUri: "mongodb+srv://username:password@cluster.mongodb.net/alumniconnect?retryWrites=true&w=majority"
};
