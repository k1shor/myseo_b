import asyncHandler from "express-async-handler";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized: missing token");
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    res.status(401);
    throw new Error("Not authorized: invalid token");
  }

  const user = await User.findById(decoded.id).select("-passwordHash");
  if (!user) {
    res.status(401);
    throw new Error("Not authorized: user not found");
  }

  req.user = user;
  next();
});

export const requireAdmin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403);
  throw new Error("Admin access only");
};
