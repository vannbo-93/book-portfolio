/** @format */

import { Schema, model, type InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

// حساب الأدمن (صاحب الموقع). لا يوجد تسجيل حساب من الموقع:
// يُنشأ الحساب من الطرفية فقط بالأمر npm run create-admin
const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // كلمة السر لا تُحفظ أبدًا كما هي، بل بصمتها المشفرة (bcrypt).
    // select: false: لا تُرسل مع أي استعلام إلا إن طُلبت صراحة
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);

export type AdminDoc = InferSchemaType<typeof adminSchema>;

// قوة التشفير: كل زيادة بواحد تضاعف الوقت. 12 متوازن (نحو ربع ثانية)
const ROUNDS = 12;
export const hashPassword = (password: string) => bcrypt.hash(password, ROUNDS);
export const checkPassword = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const Admin = model("Admin", adminSchema);
