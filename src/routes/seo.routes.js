import { Router } from "express";
import asyncHandler from "express-async-handler";
import { protect, requireAdmin } from "../middleware/auth.js";
import { SiteSettings } from "../models/SiteSettings.js";

const router = Router();

// Public: get settings
router.get("/", asyncHandler(async (req, res) => {
  let s = await SiteSettings.findOne({}).lean();
  if (!s) {
    s = await SiteSettings.create({});
    s = s.toObject();
  }
  res.json(s);
}));

// Admin: update settings
router.put("/", protect, requireAdmin, asyncHandler(async (req, res) => {
  let s = await SiteSettings.findOne({});
  if (!s) s = await SiteSettings.create({});

  const allowed = ["siteName","siteTagline","defaultMetaTitle","defaultMetaDescription","defaultKeywords","social","contact"];
  for (const k of allowed) {
    if (typeof req.body?.[k] !== "undefined") s[k] = req.body[k];
  }
  await s.save();
  res.json(s);
}));

export default router;
