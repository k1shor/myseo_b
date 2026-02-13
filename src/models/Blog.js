import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String }, // Cloudinary URL
    authorName: { type: String, required: true, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    keywords: [{ type: String, trim: true }],

    // SEO fields (admin-managed)
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    ogImage: { type: String },

    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

blogSchema.index({ slug: 1 });
blogSchema.index({ title: "text", excerpt: "text", content: "text", authorName: "text", keywords: "text" });

export const Blog = mongoose.model("Blog", blogSchema);
