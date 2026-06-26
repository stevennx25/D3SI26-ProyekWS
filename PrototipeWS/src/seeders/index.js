import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

async function seedAdmin() {
  const email = process.env.ADMIN_DEFAULT_EMAIL || "admin@istts.ac.id";
  const password = process.env.ADMIN_DEFAULT_PASSWORD || "admin12345";

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`[Seeder] Admin dengan email ${email} sudah ada, dilewati.`);
    return;
  }

  const admin = await Admin.create({
    nama: "Super Admin",
    email,
    password,
    role: "superadmin",
  });

  console.log("[Seeder] Admin default berhasil dibuat:");
  console.log(`  Email    : ${admin.email}`);
  console.log(`  Password : ${password} (ganti setelah login pertama!)`);
}

async function run() {
  await connectDB();
  await seedAdmin();
  await mongoose.disconnect();
  console.log("[Seeder] Selesai.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[Seeder] Gagal:", err);
  process.exit(1);
});
