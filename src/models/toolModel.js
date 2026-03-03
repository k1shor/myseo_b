import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String, // Cloudinary URL
            required: true
        },
        order: { type: Number, default: 0 }

    },
    { timestamps: true }
);

export default mongoose.model("Tool", toolSchema);