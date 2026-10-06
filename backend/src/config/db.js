import dotenv from 'dotenv';
dotenv.config(); // Cargamos el .env explícitamente

import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    const conn = await mongoose.connect(uri);
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    process.exit(1);
  }
};