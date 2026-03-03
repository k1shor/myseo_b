import express from "express";
import {
  getTools,
  createTool,
  updateTool,
  deleteTool,
  reorderTools,
  uploadToolImage
} from "../controllers/toolController.js";
import multer from "multer";
const router = express.Router();

const upload = multer({ dest: "uploads/" });

/* PUBLIC */
router.get("/", getTools);

/* ADMIN */
router.post("/", createTool);
router.put("/reorder", reorderTools);
router.put("/:id", updateTool);
router.delete("/:id", deleteTool);
router.post("/upload", upload.single("image"), uploadToolImage);

export default router;

