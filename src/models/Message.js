import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    replyText: { type: String, required: true, trim: true },
    repliedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional (if logged in)
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "replied"], default: "open" },
    replies: [replySchema],
  },
  { timestamps: true }
);

messageSchema.index({ email: 1, createdAt: -1 });

export const Message = mongoose.model("Message", messageSchema);
