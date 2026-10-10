/** @format */

import { Router } from "express";
import mongoose from "mongoose";

// للتأكد أن الخادم يعمل ومتصل بقاعدة البيانات: GET /api/health
const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    time: new Date().toISOString(),
  });
});

export default router;
