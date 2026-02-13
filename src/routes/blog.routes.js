import { Router } from "express";
import asyncHandler from "express-async-handler";
import { Blog } from "../models/Blog.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { upsertBlogSchema } from "../validators/blog.validators.js";

const router = Router();

// Public list with search/sort
// GET /api/blogs?search=...&author=...&keyword=...&page=1&limit=9
router.get("/", asyncHandler(async (req, res) => {
  const {
    search = "",
    author = "",
    keyword = "",
    page = "1",
    limit = "9"
  } = req.query;

  const q = {};
  q.isPublished = true;

  const and = [];
  if (author) and.push({ authorName: { $regex: author, $options: "i" } });
  if (keyword) and.push({ keywords: { $regex: keyword, $options: "i" } });
  if (search) {
    and.push({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { authorName: { $regex: search, $options: "i" } },
        { keywords: { $regex: search, $options: "i" } },
      ]
    });
  }
  if (and.length) q.$and = and;

  const p = Math.max(1, Number(page));
  const l = Math.min(50, Math.max(1, Number(limit)));

  const [items, total] = await Promise.all([
    Blog.find(q).sort({ publishedAt: -1 }).skip((p - 1) * l).limit(l).lean(),
    Blog.countDocuments(q)
  ]);

  res.json({ items, total, page: p, limit: l });
}));

// Public: details by slug
router.get("/slug/:slug", asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).lean();
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  res.json(blog);
}));

// Public: archive (recent)
router.get("/archive/recent", asyncHandler(async (req, res) => {
  const take = Math.min(20, Math.max(3, Number(req.query.take || 10)));
  const items = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(take).select("title slug coverImage publishedAt").lean();
  res.json({ items });
}));

// Admin: list all (including drafts)
router.get("/admin/all", protect, requireAdmin, asyncHandler(async (req, res) => {
  const items = await Blog.find({}).sort({ createdAt: -1 }).lean();
  res.json({ items });
}));

// Admin: create
router.post("/", protect, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = upsertBlogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const exists = await Blog.findOne({ slug: parsed.data.slug });
  if (exists) {
    res.status(409);
    throw new Error("Slug already exists");
  }

  const blog = await Blog.create({
    ...parsed.data,
    authorId: req.user._id
  });

  res.status(201).json(blog);
}));

// Admin: update by id
router.put("/:id", protect, requireAdmin, asyncHandler(async (req, res) => {
  const parsed = upsertBlogSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400);
    throw new Error(parsed.error.issues?.[0]?.message || "Invalid payload");
  }

  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }

  // protect slug uniqueness
  if (parsed.data.slug !== blog.slug) {
    const exists = await Blog.findOne({ slug: parsed.data.slug });
    if (exists) {
      res.status(409);
      throw new Error("Slug already exists");
    }
  }

  Object.assign(blog, parsed.data);
  await blog.save();
  res.json(blog);
}));

// Admin: delete
router.delete("/:id", protect, requireAdmin, asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    res.status(404);
    throw new Error("Blog not found");
  }
  await blog.deleteOne();
  res.json({ ok: true });
}));

export default router;
