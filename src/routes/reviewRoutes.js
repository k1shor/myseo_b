import express from "express";
import { createReview, deleteReview, getPublicReviews, getReviewById, getReviews, updateReview } from "../controllers/reviewController.js";
const router = express.Router();


// import {
//   createReview,
//   getReviews,
//   getPublicReviews,
//   getReviewById,
//   updateReview,
//   deleteReview,
// }  from "../controllers/reviewController.js";

// Public (for your carousel)
router.get("/public", getPublicReviews);

// Admin / CRUD
router.post("/", createReview);
router.get("/", getReviews);
router.get("/:id", getReviewById);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;