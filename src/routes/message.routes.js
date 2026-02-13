import { Router } from "express";
import asyncHandler from "express-async-handler";
import { protect, requireAdmin } from "../middleware/auth.js";
import { Message } from "../models/Message.js";
import { createMessageSchema, replySchema } from "../validators/message.validators.js";
import { User } from "../models/User.js";
import { getMailer } from "../utils/mailer.js";

const router = Router();

// Public: create message (contact form)
// If Authorization token exists, attach userId/email from user; otherwise accepts email in body
router.post("/", asyncHandler(async (req, res) => {
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const msg = await Message.create({
    ...parsed.data,
  });

  res.status(201).json({ ok: true, messageId: msg._id });
}));

// Authenticated user: create message tied to user
router.post("/me", protect, asyncHandler(async (req, res) => {
  const parsed = createMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const msg = await Message.create({
    ...parsed.data,
    userId: req.user._id,
    email: req.user.email
  });

  res.status(201).json({ ok: true, messageId: msg._id });
}));

// Admin: list all messages
router.get("/admin", protect, requireAdmin, asyncHandler(async (req, res) => {
  const items = await Message.find({}).sort({ createdAt: -1 }).lean();
  res.json({ items });
}));

// Admin: reply to message
router.post("/admin/:id/reply", protect, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = replySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const msg = await Message.findById(req.params.id);
  if (!msg) {
    res.status(404);
    throw new Error("Message not found");
  }

  msg.replies.push({
    repliedBy: req.user._id,
    replyText: parsed.data.replyText
  });
  msg.status = "replied";
  await msg.save();

  // Optional email sending
  const mailer = getMailer();
  if (mailer) {
    try {
      const from = process.env.SMTP_FROM || "MySEO <no-reply@myseo.com>";
      await mailer.sendMail({
        from,
        to: msg.email,
        subject: `Re: ${msg.subject}`,
        text: parsed.data.replyText
      });
    } catch (e) {
      console.warn("⚠️ Email send failed (reply still saved):", e?.message);
    }
  }

  res.json({ ok: true, message: msg });
}));

export default router;
