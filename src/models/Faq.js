import mongoose from "mongoose";
 
const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [300, "Question max 300 chars"]
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      maxlength: [2000, "Answer max 2000 chars"]
    },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);
 
faqSchema.index({ order: 1, createdAt: -1 });
 
export const Faq = mongoose.model("Faq", faqSchema);