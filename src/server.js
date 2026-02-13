import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { connectDb } from "./utils/db.js";
import { notFound, errorHandler } from "./middleware/error.js";
import { seedAdminIfMissing } from "./utils/seedAdmin.js";
import { configureCloudinary } from "./utils/cloudinary.js";
import { configurePassport } from "./utils/passport.js";

import authRoutes from "./routes/auth.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import seoRoutes from "./routes/seo.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

configureCloudinary();
configurePassport(app);

app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/seo", seoRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDb();
  await seedAdminIfMissing();
  app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
})();
