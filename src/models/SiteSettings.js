import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "MySEO" },
    siteTagline: { type: String, default: "Digital Marketing & SEO Specialist" },
    defaultMetaTitle: { type: String, default: "MySEO — Digital Marketing & SEO" },
    defaultMetaDescription: { type: String, default: "Elegant SEO-first blog and services for brands that want measurable growth." },
    defaultKeywords: [{ type: String, default: ["seo", "digital marketing", "content strategy"] }],
    social: {
      facebook: String,
      instagram: String,
      linkedin: String,
      tiktok: String,
      youtube: String,
      x: String
    },
    contact: {
      address: String,
      phone: String,
      email: String,
      mapEmbedUrl: String
    }
  },
  { timestamps: true }
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);
