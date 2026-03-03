import Tool from "../models/toolModel.js";
import { cloudinary } from "../utils/cloudinary.js";


/* =========================
   PUBLIC
========================= */

export const getTools = async (req, res) => {
    try {
        const tools = await Tool.find().sort({ order: 1, createdAt: -1 });
        res.json({ success: true, items: tools });
    } catch {
        res.status(500).json({ message: "Failed to fetch tools." });
    }
};

/* =========================
   ADMIN CRUD
========================= */

export const createTool = async (req, res) => {
    try {
        const { name, description, image } = req.body;

        if (!name || !description || !image) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const tool = await Tool.create({ name, description, image });

        res.status(201).json({ success: true, item: tool });
    } catch {
        res.status(500).json({ message: "Failed to create tool." });
    }
};

export const updateTool = async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        if (!tool) return res.status(404).json({ message: "Tool not found." });

        tool.name = req.body.name ?? tool.name;
        tool.description = req.body.description ?? tool.description;
        tool.image = req.body.image ?? tool.image;

        await tool.save();

        res.json({ success: true, item: tool });
    } catch {
        res.status(500).json({ message: "Failed to update tool." });
    }
};

export const deleteTool = async (req, res) => {
    try {
        const tool = await Tool.findById(req.params.id);
        if (!tool) return res.status(404).json({ message: "Tool not found." });

        await tool.deleteOne();
        res.json({ success: true });
    } catch {
        res.status(500).json({ message: "Failed to delete tool." });
    }
};

export const reorderTools = async (req, res) => {
    console.log("Incoming reorder payload:", req.body);
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const bulkOps = items
      .filter((i) => i.id || i._id)
      .map((item) => ({
        updateOne: {
          filter: { _id: item.id || item._id },
          update: { $set: { order: Number(item.order) || 0 } }
        }
      }));

    if (!bulkOps.length) {
      return res.status(400).json({ message: "No valid items to reorder." });
    }

    await Tool.bulkWrite(bulkOps);

    res.json({ success: true });
  } catch (err) {
    console.error("Reorder error:", err);
    res.status(500).json({ message: "Failed to reorder tools." });
  }
};


export const uploadToolImage = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "tools"
        });

        res.json({ url: result.secure_url });
    } catch {
        res.status(500).json({ message: "Upload failed" });
    }
};