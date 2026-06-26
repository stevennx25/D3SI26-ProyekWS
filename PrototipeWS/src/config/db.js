import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI belum diset di file .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Terhubung ke database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("[MongoDB] Gagal terhubung:", err.message);
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Koneksi terputus");
  });
}
