import { CaseStudy } from "../models/casestudyModel.js";
import asyncHandler from "express-async-handler";

// ─────────────────────────────────────────────
// PUBLIC
// ─────────────────────────────────────────────

export const getPublicCaseStudies = asyncHandler(async (req, res) => {
  const items = await CaseStudy.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .select("-content")
    .lean();

  res.json({ success: true, items });
});

export const getPublicCaseStudyBySlug = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findOne({
    slug: req.params.slug,
    isPublished: true,
  }).lean();

  if (!item) {
    res.status(404);
    throw new Error("Case study not found");
  }

  res.json({ success: true, item });
});

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────

export const adminGetAll = asyncHandler(async (req, res) => {
  const items = await CaseStudy.find({}).sort({ publishedAt: -1 }).lean();

  res.json({ success: true, items });
});

export const adminGetById = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findById(req.params.id).lean();
  if (!item) {
    res.status(404);
    throw new Error("Case study not found");
  }
  res.json({ success: true, item });
});

export const adminCreate = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const existing = await CaseStudy.findOne({ slug: body.slug });
  if (existing) {
    res.status(409);
    throw new Error("Slug already exists");
  }

  const item = await CaseStudy.create(sanitize(body));
  res.status(201).json({ success: true, item });
});

export const adminUpdate = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Case study not found");
  }

  const body = req.body || {};
  if (body.slug && body.slug !== item.slug) {
    const existing = await CaseStudy.findOne({ slug: body.slug });
    if (existing) {
      res.status(409);
      throw new Error("Slug already exists");
    }
  }

  Object.assign(item, sanitize(body));
  await item.save();
  res.json({ success: true, item });
});

export const adminDelete = asyncHandler(async (req, res) => {
  const item = await CaseStudy.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("Case study not found");
  }
  await item.deleteOne();
  res.json({ success: true, message: "Deleted" });
});

function sanitize(body) {
  return {
    title: body.title,
    slug: body.slug,
    client: body.client,
    industry: body.industry,
    content: body.content,
    coverImage: body.coverImage,
    metaTitle: body.metaTitle,
    metaDescription: body.metaDescription,
    isPublished:
      typeof body.isPublished === "boolean" ? body.isPublished : true,
    publishedAt: body.publishedAt || new Date(),
  };
}
