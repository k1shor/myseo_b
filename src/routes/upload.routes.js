import { Router } from "express";
import asyncHandler from "express-async-handler";
import multer from "multer";
import { protect, requireAdmin } from "../middleware/auth.js";
import { cloudinary } from "../utils/cloudinary.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 7 * 1024 * 1024 } }); // 7MB

router.post("/image", protect, requireAdmin, upload.single("image"), asyncHandler(async (req, res) => {
  if (!cloudinary?.uploader) {
    res.status(500);
    throw new Error("Cloudinary not configured");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("Missing image file");
  }

  const b64 = req.file.buffer.toString("base64");
  const dataUri = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "myseo",
    resource_type: "image"
  });

  res.json({ url: result.secure_url, public_id: result.public_id });
}));

export default router;
