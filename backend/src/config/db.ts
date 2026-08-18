import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI is missing from environment variables! Please set MONGODB_URI in Render dashboard.');
    return;
  }
  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'organicmart'
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
  }
};

