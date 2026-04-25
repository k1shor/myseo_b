import mongoose from "mongoose";

const CaseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },

    client: { type: String, trim: true },
    industry: { type: String, trim: true },

    // SEO
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },

    coverImage: { type: String }, // Cloudinary URL
    content: { type: String, trim: true },

    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CaseStudySchema.index({ slug: 1 });
CaseStudySchema.index({ isPublished: 1, publishedAt: -1 });

export const CaseStudy = mongoose.model("CaseStudy", CaseStudySchema);
