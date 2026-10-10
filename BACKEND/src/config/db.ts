/** @format */

import mongoose from "mongoose";
import { env } from "./env.js";

// الاتصال بقاعدة البيانات. إن فشل، يتوقف الخادم: لا فائدة من خادم بلا بيانات
export const connectDB = async () => {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(`✓ MongoDB connected (${mongoose.connection.name})`);
  } catch (err) {
    console.error("✗ MongoDB connection failed:", (err as Error).message);
    process.exit(1);
  }
};
