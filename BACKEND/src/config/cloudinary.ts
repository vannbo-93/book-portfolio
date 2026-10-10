/** @format */

import { v2 as cloudinary } from "cloudinary";
import { env } from "./env.js";

// ربط الخادم بحساب Cloudinary (مرة واحدة عند التشغيل)
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true, // روابط https دائمًا
});

export default cloudinary;
