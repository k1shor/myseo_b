import { Router } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { protect, requireAdmin } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { Message } from "../models/Message.js";
import { adminCreateUserSchema } from "../validators/auth.validators.js";

const router = Router();

// Profile (self)
router.get("/me", protect, asyncHandler(async (req, res) => {
  res.json(sanitize(req.user));
}));

// Messages visible to user (by email OR userId)
router.get("/me/messages", protect, asyncHandler(async (req, res) => {
  const or = [{ email: req.user.email }];
  or.push({ userId: req.user._id });

  const items = await Message.find({ $or: or }).sort({ createdAt: -1 }).lean();
  res.json({ items });
}));

// Admin: list users
router.get("/admin", protect, requireAdmin, asyncHandler(async (req, res) => {
  const users = await User.find({}).sort({ createdAt: -1 }).select("-passwordHash").lean();
  res.json({ users });
}));

// Admin: create user
router.post("/admin", protect, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = adminCreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const { name, email, phone, password, role } = parsed.data;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error("Email already exists");
  }

  const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role
  });

  res.status(201).json({ user: sanitize(user) });
}));

// Admin: toggle active
router.patch("/admin/:id/toggle", protect, requireAdmin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ user: sanitize(user) });
}));

function sanitize(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatarUrl: u.avatarUrl,
    provider: u.provider,
    isActive: u.isActive,
    createdAt: u.createdAt
  };
}

export default router;
