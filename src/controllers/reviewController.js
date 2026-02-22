// src/controllers/reviewController.js (ES Module)

import {Review} from "../models/reviews.js";
// import asyncHandler from "../utils/asyncHandler.js";

/**
 * POST /api/reviews
 * Create a review
 */
export const createReview = (async (req, res) => {
  const { clientName, clientUrl, rating, text, isPublished } = req.body;

  const created = await Review.create({
    clientName,
    clientUrl,
    rating,
    text,
    isPublished: typeof isPublished === "boolean" ? isPublished : true,
  });

  res.status(201).json({ success: true, item: created });
});

/**
 * GET /api/reviews
 * Admin list (can include unpublished)
 * Query:
 *  - page (default 1)
 *  - limit (default 12)
 *  - published (optional true/false)
 *  - sort (default -createdAt)
 */
export const getReviews = (async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "12", 10), 1), 100);
  const skip = (page - 1) * limit;

  const sort = req.query.sort || "-createdAt";

  const filter = {};
  if (typeof req.query.published !== "undefined") {
    filter.isPublished = String(req.query.published) === "true";
  }

  const [items, total] = await Promise.all([
    Review.find(filter).sort(sort).skip(skip).limit(limit),
    Review.countDocuments(filter),
  ]);

  res.json({
    success: true,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    items,
  });
});

/**
 * GET /api/reviews/public
 * Public list for frontend carousel (published only)
 * Query:
 *  - limit (default 20)
 *  - sort (default -createdAt)
 */
export const getPublicReviews = (async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const sort = req.query.sort || "-createdAt";

  const items = await Review.find({ isPublished: true }).sort(sort).limit(limit);

  res.json({ success: true, items });
});

/**
 * GET /api/reviews/:id
 */
export const getReviewById = (async (req, res) => {
  const item = await Review.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }
  res.json({ success: true, item });
});

/**
 * PUT /api/reviews/:id
 * Full update
 */
export const updateReview = (async (req, res) => {
  const { clientName, clientUrl, rating, text, isPublished } = req.body;

  const item = await Review.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  if (typeof clientName !== "undefined") item.clientName = clientName;
  if (typeof clientUrl !== "undefined") item.clientUrl = clientUrl;
  if (typeof rating !== "undefined") item.rating = rating;
  if (typeof text !== "undefined") item.text = text;
  if (typeof isPublished !== "undefined") item.isPublished = isPublished;

  await item.save();

  res.json({ success: true, item });
});

/**
 * DELETE /api/reviews/:id
 */
export const deleteReview = (async (req, res) => {
  const item = await Review.findById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  await item.deleteOne();
  res.json({ success: true, message: "Review deleted" });
});