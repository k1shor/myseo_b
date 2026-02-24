import asyncHandler from "express-async-handler";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

/**
 * 🔐 Protect middleware
 * - Reads Bearer token
 * - Verifies JWT
 * - Loads user from DB
 * - Attaches req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ")
    ? header.slice(7).trim()
    : null;

  if (!token) {
    res.status(401);
    throw new Error("Not authorized: missing token");
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    res.status(401);
    throw new Error("Not authorized: invalid token");
  }

  if (!decoded?.id) {
    res.status(401);
    throw new Error("Not authorized: invalid token payload");
  }

  const user = await User.findById(decoded.id).select("-passwordHash");

  if (!user) {
    res.status(401);
    throw new Error("Not authorized: user not found");
  }

  // Optional: block inactive users if you have such field
  // if (user.isActive === false) {
  //   res.status(403);
  //   throw new Error("Account disabled");
  // }

  req.user = user;
  next();
});

/**
 * 🛡 Require admin role
 */
export const requireAdmin = (req, res, next) => {
  const role = req.user?.role;

  if (role === "admin") return next();

  res.status(403);
  throw new Error("Admin access only");
};

/**
 * 🧩 Optional generic role guard
 * Usage:
 *   router.put("/x", protect, requireRole("admin", "editor"), handler)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (req.user?.role && roles.includes(req.user.role)) {
      return next();
    }
    res.status(403);
    throw new Error("Forbidden");
  };
};