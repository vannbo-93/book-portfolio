/** @format */

import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";

// نقطة البداية: الاتصال بقاعدة البيانات أولًا، ثم تشغيل الخادم
await connectDB();

app.listen(env.PORT, () => {
  console.log(
    `✓ API running on http://localhost:${env.PORT} (${env.NODE_ENV})`,
  );
});
