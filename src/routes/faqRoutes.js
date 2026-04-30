import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
  getPublicFaqs,
  getAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
} from "../controllers/faqController.js";

const router = express.Router();

router.get("/", getPublicFaqs);

// admin routes
router.get("/Admin", protect, requireAdmin, getAdminFaqs);

router.post("/", protect, requireAdmin, createFaq);
router.put("/reorder", protect, requireAdmin, reorderFaqs); // must be before /:id
router.put("/:id", protect, requireAdmin, updateFaq);
router.delete("/:id", protect, requireAdmin, deleteFaq);

export default router;
