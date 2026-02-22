// const mongoose = require("mongoose");
import mongoose from "mongoose";


const ReviewSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, "clientName is required"],
      trim: true,
      maxlength: [80, "clientName max 80 chars"],
    },
    clientUrl: {
      type: String,
      trim: true,
      maxlength: [500, "clientUrl max 500 chars"],
      default: "",
    },
    rating: {
      type: Number,
      required: [true, "rating is required"],
      min: [0, "rating must be >= 0"],
      max: [5, "rating must be <= 5"],
    },
    text: {
      type: String,
      required: [true, "text is required"],
      trim: true,
      minlength: [10, "text must be at least 10 chars"],
      maxlength: [1000, "text max 1000 chars"],
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Optional: normalize rating to 0.5 steps (ex: 4.2 -> 4.0, 4.7 -> 4.5)
// If you DON'T want this, remove this middleware.
ReviewSchema.pre("save", function (next) {
  if (typeof this.rating === "number") {
    this.rating = Math.round(this.rating * 2) / 2;
  }
  next();
});

export const Review = mongoose.model("Review", ReviewSchema);