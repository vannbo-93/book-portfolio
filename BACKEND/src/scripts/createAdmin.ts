/** @format */

import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Admin, hashPassword } from "../models/Admin.js";

// إنشاء حساب الأدمن أو تغيير كلمة سره، من الطرفية فقط:
//   npm run create-admin -- you@example.com "a-strong-password"
// إن كان البريد موجودًا: تُستبدل كلمة سره (مفيد إن نسيتها)

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> "<password>"');
  process.exit(1);
}
if (password.length < 10) {
  console.error("✗ Password must be at least 10 characters");
  process.exit(1);
}

await connectDB();
const passwordHash = await hashPassword(password);
const existing = await Admin.findOne({ email: email.toLowerCase().trim() });
if (existing) {
  existing.passwordHash = passwordHash;
  await existing.save();
  console.log(`✓ Password updated for ${existing.email}`);
} else {
  const admin = await Admin.create({ email, passwordHash });
  console.log(`✓ Admin created: ${admin.email}`);
}
await mongoose.disconnect();
