// Run: npm run seed:reviews
// Optional: SEED_CLEAR=true npm run seed:reviews

import "dotenv/config";
import mongoose from "mongoose";
import { Review } from "../models/reviews.js";

// Dummy seed data
const REVIEWS_SEED = [
    {
        clientName: "Aarav Shrestha",
        clientUrl: "https://example.com/aarav",
        rating: 5,
        text: "Super smooth experience end-to-end. Communication was clear, delivery was fast, and the final output looked premium.",
        isPublished: true,
    },
    {
        clientName: "Binisha Maharjan",
        clientUrl: "https://example.com/binisha",
        rating: 4.5,
        text: "Very professional and responsive. The UI/UX improvements noticeably boosted engagement. Highly recommended.",
        isPublished: true,
    },
    {
        clientName: "Suman Adhikari",
        clientUrl: "https://example.com/suman",
        rating: 4,
        text: "Great support and clean code. Minor revisions were handled quickly and the project stayed on schedule.",
        isPublished: true,
    },
    {
        clientName: "Nisha Karki",
        clientUrl: "https://example.com/nisha",
        rating: 5,
        text: "Excellent quality, modern design, and solid performance. The team was proactive with suggestions too.",
        isPublished: true,
    },
    {
        clientName: "Pratik Lama",
        clientUrl: "https://example.com/pratik",
        rating: 4.2,
        text: "Good planning and execution. Everything was transparent and well documented. Would work together again.",
        isPublished: true,
    },
];

async function connectDB() {
    // if (!process.env.MONGODB_URI) {
    //     throw new Error("MONGO_URI missing in .env");
    // }

    mongoose.set("strictQuery", true);
    await mongoose.connect('mongodb+srv://test:test123@cluster0.2aidv.mongodb.net/indexClient?retryWrites=true&w=majority&appName=Cluster0');
    console.log("✅ MongoDB connected (seed)");
}

async function seed() {
    const shouldClear = String(process.env.SEED_CLEAR || "").toLowerCase() === "true";

    if (shouldClear) {
        const del = await Review.deleteMany({});
        console.log(`🧹 Cleared reviews: ${del.deletedCount}`);
    }

    const inserted = await Review.insertMany(REVIEWS_SEED);
    console.log(`✅ Seeded reviews: ${inserted.length}`);

    inserted.slice(0, 3).forEach((r, i) => {
        console.log(
            `#${i + 1} ${r.clientName} | ${r.rating}/5 | ${r.clientUrl || "(no url)"}`
        );
    });
}

try {
    await connectDB();
    await seed();
    await mongoose.disconnect();
    console.log("🔌 Disconnected. Done.");
    process.exit(0);
} catch (err) {
    console.error("❌ Seed failed:", err.message);
    await mongoose.disconnect();
    process.exit(1);
}