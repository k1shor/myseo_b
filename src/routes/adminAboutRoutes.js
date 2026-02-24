import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import {
  getAdminAbout,
  upsertAbout
} from "../controllers/aboutController.js";

const router = express.Router();

router.get("/", protect, requireAdmin, getAdminAbout);
router.put("/", protect, requireAdmin, upsertAbout);

export default router;