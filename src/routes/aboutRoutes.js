import express from "express";
import { getPublicAbout } from "../controllers/aboutController.js";

const router = express.Router();

// 🌐 Public About endpoint
// GET /api/about
router.get("/", getPublicAbout);

export default router;