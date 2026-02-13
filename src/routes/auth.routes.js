import { Router } from "express";
import passport from "passport";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";

import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { verifyRecaptcha } from "../utils/recaptcha.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";

const router = Router();

router.post("/register", asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const { name, email, phone, password, recaptchaToken } = parsed.data;

  const ok = await verifyRecaptcha(recaptchaToken);
  if (!ok) {
    res.status(400);
    throw new Error("reCAPTCHA verification failed");
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: "user",
    provider: "local"
  });

  const token = signToken({ id: user._id, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
}));

router.post("/login", asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const { email, password } = parsed.data;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = signToken({ id: user._id, role: user.role });
  res.json({ token, user: sanitizeUser(user) });
}));

// Google OAuth social login (optional)
// GET /api/auth/google
router.get("/google", (req, res, next) => {
  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;
  if (!hasGoogle) return res.status(503).json({ message: "Google OAuth not configured" });
  return passport.authenticate("google", { scope: ["profile", "email"], session: false })(req, res, next);
});

// GET /api/auth/google/callback
router.get("/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?err=oauth` }),
  (req, res) => {
    const user = req.user;
    const token = signToken({ id: user._id, role: user.role });
    // Redirect back to frontend with token in query (frontend stores to localStorage)
    const url = new URL("/auth/callback", process.env.CLIENT_URL || "http://localhost:3000");
    url.searchParams.set("token", token);
    url.searchParams.set("name", user.name);
    url.searchParams.set("email", user.email);
    url.searchParams.set("role", user.role);
    res.redirect(url.toString());
  }
);

function sanitizeUser(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatarUrl: u.avatarUrl,
    provider: u.provider
  };
}

export default router;
