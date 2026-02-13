import { z } from "zod";

export const createMessageSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3).max(140),
  message: z.string().min(10).max(5000)
});

export const replySchema = z.object({
  replyText: z.string().min(2).max(5000)
});
