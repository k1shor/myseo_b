import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Blog } from "../models/Blog.js";
import { User } from "../models/User.js";

function mustGetEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildHtml() {
  return `
    <p><strong>Quick insight:</strong> Most SEO content fails because it is written for algorithms, not humans.</p>

    <h3>1) What We’re Solving</h3>
    <p>This article gives you a clean checklist you can actually apply today and measure within weeks.</p>

    <h3>2) The Framework</h3>
    <ul>
      <li><strong>Intent:</strong> Match searcher expectations</li>
      <li><strong>Structure:</strong> Clean headings & internal linking</li>
      <li><strong>Evidence:</strong> Examples & case insights</li>
      <li><strong>CTA:</strong> Clear next step</li>
    </ul>

    <h3>3) Action Steps</h3>
    <ol>
      <li>Audit your current content</li>
      <li>Optimize metadata</li>
      <li>Improve structure</li>
      <li>Track and iterate</li>
    </ol>

    <p><em>Need help implementing this? Contact us and we’ll plan your fastest wins first.</em></p>
  `;
}

const posts = [
  {
    title: "SEO Basics That Actually Move Rankings",
    excerpt:
      "A practical SEO baseline focusing on structure, metadata, and intent.",
    keywords: ["seo", "technical seo", "content strategy"],
    coverImage:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "How to Build Content Clusters That Win",
    excerpt:
      "Step-by-step guide to topic clusters and authority building.",
    keywords: ["content clusters", "featured snippets", "seo"],
    coverImage:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Local SEO Blueprint for 2026",
    excerpt:
      "Optimize Google Business Profile and dominate local search.",
    keywords: ["local seo", "google business", "reviews"],
    coverImage:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Website Speed Optimization for Marketers",
    excerpt:
      "Improve Core Web Vitals and boost conversions instantly.",
    keywords: ["core web vitals", "performance", "conversion"],
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Keyword Research Workflow That Converts",
    excerpt:
      "Modern keyword research from intent to opportunity.",
    keywords: ["keyword research", "search intent", "seo"],
    coverImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80",
  },
];

async function connect() {
  const uri = mustGetEnv("MONGODB_URI");
  await mongoose.connect(uri);
}

async function main() {
  const destroy = process.argv.includes("--destroy");
  await connect();

  const adminEmail =
    (process.env.SEED_ADMIN_EMAIL || "admin@myseo.com")
      .toLowerCase()
      .trim();

  const admin = await User.findOne({ email: adminEmail });

  if (!admin) {
    console.log(
      "⚠️ Admin not found. Start backend once to auto-seed admin, then run seeder again."
    );
    process.exit(1);
  }

  if (destroy) {
    const slugs = posts.map((p) => slugify(p.title));
    const result = await Blog.deleteMany({ slug: { $in: slugs } });
    console.log(`🧹 Removed ${result.deletedCount} seeded blogs`);
    process.exit(0);
  }

  let created = 0;
  let updated = 0;

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const slug = slugify(p.title);
    const publishedAt = new Date(Date.now() - (posts.length - i) * 86400000);

    const doc = {
      title: p.title,
      slug,
      excerpt: p.excerpt,
      content: buildHtml(),
      coverImage: p.coverImage,
      authorName: admin.name || "Admin",
      authorId: admin._id,
      keywords: p.keywords,
      metaTitle: p.title,
      metaDescription: p.excerpt,
      ogImage: p.coverImage,
      isPublished: true,
      publishedAt,
    };

    const exists = await Blog.findOne({ slug });
    if (exists) {
      await Blog.updateOne({ _id: exists._id }, doc);
      updated++;
    } else {
      await Blog.create(doc);
      created++;
    }
  }

  console.log(`✅ Seed complete. Created: ${created} • Updated: ${updated}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
