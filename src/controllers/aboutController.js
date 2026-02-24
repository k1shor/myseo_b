import About from "../models/About.js";
import asyncHandler from "express-async-handler";

/**
 * Utility: sanitize arrays & strings lightly
 */
function cleanStr(x) {
  return typeof x === "string" ? x.trim() : "";
}
function cleanArr(x) {
  return Array.isArray(x) ? x.filter(Boolean) : [];
}

/**
 * PUBLIC: GET /api/about
 * Returns published about section
 */
export const getPublicAbout = asyncHandler(async (req, res) => {
  const doc = await About.findOne({ key: "default", isPublished: true }).lean();

  if (!doc) {
    return res.json({
      success: true,
      item: null,
      message: "About not configured yet"
    });
  }

  return res.json({ success: true, item: doc });
});

/**
 * ADMIN: GET /api/admin/about
 * Returns about section (published or not)
 */
export const getAdminAbout = asyncHandler(async (req, res) => {
  const doc = await About.findOne({ key: "default" }).lean();
  return res.json({ success: true, item: doc });
});

/**
 * ADMIN: PUT /api/admin/about
 * Upsert: create if missing, otherwise update.
 * Body: { meta, page, content, isPublished }
 */
export const upsertAbout = asyncHandler(async (req, res) => {
  const body = req.body || {};

  // Minimal normalization (avoid undefined noise)
  const update = {
    meta: body.meta || {},
    page: body.page || {},
    content: body.content || {},
    isPublished: typeof body.isPublished === "boolean" ? body.isPublished : true
  };

  // Optional: tidy a few common fields
  if (update.meta) {
    update.meta.title = cleanStr(update.meta.title);
    update.meta.description = cleanStr(update.meta.description);
    update.meta.keywords = cleanStr(update.meta.keywords);
    update.meta.canonical = cleanStr(update.meta.canonical || "/about");

    if (update.meta.og) {
      update.meta.og.title = cleanStr(update.meta.og.title);
      update.meta.og.description = cleanStr(update.meta.og.description);
      update.meta.og.image = cleanStr(update.meta.og.image);
      update.meta.og.type = cleanStr(update.meta.og.type || "website");
    } else {
      // Ensure structure exists if admin sends meta without og
      update.meta.og = {
        title: cleanStr(update.meta.title),
        description: cleanStr(update.meta.description),
        image: "",
        type: "website"
      };
    }

    if (update.meta.twitter) {
      update.meta.twitter.card = cleanStr(
        update.meta.twitter.card || "summary_large_image"
      );
      update.meta.twitter.title = cleanStr(update.meta.twitter.title);
      update.meta.twitter.description = cleanStr(update.meta.twitter.description);
      update.meta.twitter.image = cleanStr(update.meta.twitter.image);
    } else {
      update.meta.twitter = {
        card: "summary_large_image",
        title: cleanStr(update.meta.title),
        description: cleanStr(update.meta.description),
        image: ""
      };
    }
  }

  // Normalize arrays commonly edited in CMS
  if (update.content?.whatYouGet) {
    update.content.whatYouGet.items = cleanArr(update.content.whatYouGet.items).map(cleanStr);
  }

  if (update.content?.featureCards) {
    update.content.featureCards = cleanArr(update.content.featureCards).map((c) => ({
      title: cleanStr(c?.title),
      desc: cleanStr(c?.desc)
    })).filter((c) => c.title && c.desc);
  }

  // Upsert single doc
  const saved = await About.findOneAndUpdate(
    { key: "default" },
    { $set: update, $setOnInsert: { key: "default" } },
    { new: true, upsert: true }
  ).lean();

  return res.json({ success: true, item: saved });
});