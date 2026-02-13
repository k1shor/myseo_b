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


const normalize = (url) => (url || "").replace(/\/$/, "");

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
].filter(Boolean).map(normalize);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      const cleanOrigin = normalize(origin);

      const isVercelPreview =
        /^https:\/\/myseo-[a-z0-9-]+-k1shors-projects\.vercel\.app$/.test(cleanOrigin);

      if (allowedOrigins.includes(cleanOrigin) || isVercelPreview) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);



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
