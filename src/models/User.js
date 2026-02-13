import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    providerId: { type: String },
    avatarUrl: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });

export const User = mongoose.model("User", userSchema);
