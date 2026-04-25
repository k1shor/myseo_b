import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
  getPublicCaseStudies,
  getPublicCaseStudyBySlug,
  adminGetAll,
  adminGetById,
  adminCreate,
  adminUpdate,
  adminDelete,
} from "../controllers/casestudyController.js";

const router = express.Router();

// PUBLIC
router.get("/", getPublicCaseStudies);

// ADMIN
router.get("/admin", protect, requireAdmin, adminGetAll);
router.get("/admin/:id", protect, requireAdmin, adminGetById);
router.post("/admin", protect, requireAdmin, adminCreate);
router.put("/admin/:id", protect, requireAdmin, adminUpdate);
router.delete("/admin/:id", protect, requireAdmin, adminDelete);

router.get("/:slug", getPublicCaseStudyBySlug);

export default router;
