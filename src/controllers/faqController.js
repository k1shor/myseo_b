import { Faq } from "../models/Faq.js";
import asyncHandler from "express-async-handler";


export const getPublicFaqs = asyncHandler(async (req, res) => {
  const items = await Faq.find({ isPublished: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();
  res.json({ success: true, items });
});


export const getAdminFaqs = asyncHandler(async (req, res) => {
  const items = await Faq.find({})
    .sort({ order: 1, createdAt: 1 })
    .lean();
  res.json({ success: true, items });
});


export const createFaq = asyncHandler(async (req, res) => {
  const { question, answer, isPublished, order } = req.body;

  if (!question?.trim() || !answer?.trim()) {
    res.status(400);
    throw new Error("Question and answer are required");
  }

  let assignedOrder = order;
  if (typeof assignedOrder !== "number") {
    const last = await Faq.findOne({}).sort({ order: -1 }).lean();
    assignedOrder = last ? last.order + 1 : 0;
  }

  const item = await Faq.create({
    question: question.trim(),
    answer: answer.trim(),
    isPublished: typeof isPublished === "boolean" ? isPublished : true,
    order: assignedOrder
  });

  res.status(201).json({ success: true, item });
});


export const updateFaq = asyncHandler(async (req, res) => {
  const item = await Faq.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  const { question, answer, isPublished, order } = req.body;

  if (typeof question !== "undefined") item.question = question.trim();
  if (typeof answer !== "undefined") item.answer = answer.trim();
  if (typeof isPublished !== "undefined") item.isPublished = isPublished;
  if (typeof order === "number") item.order = order;

  await item.save();
  res.json({ success: true, item });
});


export const deleteFaq = asyncHandler(async (req, res) => {
  const item = await Faq.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error("FAQ not found");
  }
  await item.deleteOne();
  res.json({ success: true, message: "FAQ deleted" });
});


export const reorderFaqs = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || !items.length) {
    res.status(400);
    throw new Error("Invalid payload: items array required");
  }

  const bulkOps = items
    .filter((i) => i.id || i._id)
    .map((item) => ({
      updateOne: {
        filter: { _id: item.id || item._id },
        update: { $set: { order: Number(item.order) || 0 } }
      }
    }));

  if (!bulkOps.length) {
    res.status(400);
    throw new Error("No valid items to reorder");
  }

  await Faq.bulkWrite(bulkOps);
  res.json({ success: true });
});