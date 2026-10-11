/** @format */

import { createInterface } from "node:readline";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Admin, hashPassword } from "../models/Admin.js";

// إنشاء حساب الأدمن أو تغيير كلمة سره، من الطرفية فقط:
//   npm run create-admin -- you@example.com
// ثم تُكتب كلمة السر عند الطلب، مخفية: لا تظهر على الشاشة ولا تُحفظ في سجل أوامر الطرفية.
// إن كان البريد موجودًا: تُستبدل كلمة سره (مفيد إن نسيتها)

// سؤال بإدخال مخفي (لا تُعرض الأحرف المكتوبة)
const askHidden = (question: string) =>
  new Promise<string>((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    const output = rl as unknown as {
      _writeToOutput: (s: string) => void;
      output: NodeJS.WriteStream;
    };
    let muted = false;
    output._writeToOutput = (s: string) => {
      if (!muted) output.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });

const [email] = process.argv.slice(2);
if (!email) {
  console.error("Usage: npm run create-admin -- <email>");
  process.exit(1);
}

const password = await askHidden("Password (min 10 characters): ");
if (password.length < 10) {
  console.error("✗ Password must be at least 10 characters");
  process.exit(1);
}
if ((await askHidden("Repeat password: ")) !== password) {
  console.error("✗ Passwords do not match");
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
