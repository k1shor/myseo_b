import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function seedAdminIfMissing() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@myseo.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || "Admin@12345";
  const name = process.env.SEED_ADMIN_NAME || "MySEO Admin";

  const exists = await User.findOne({ email });
  if (exists) {
    console.log("ℹ️ Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    provider: "local"
  });

  console.log("✅ Seeded admin:", email);
}
