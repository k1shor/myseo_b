import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(100),
  recaptchaToken: z.string().min(1)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const adminCreateUserSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.enum(["user", "admin"]).default("user")
});
