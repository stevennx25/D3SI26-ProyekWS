import mongoose from "mongoose";

const mahasiswaSchema = new mongoose.Schema(
  {
    nrp: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    nama: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    noHp: {
      type: String,
      required: true,
      trim: true,
    },
    prodi: {
      type: String,
      required: true,
      trim: true,
      // contoh: "S1 Teknik Informatika", "D3 Manajemen Informatika"
    },
    fakultas: {
      type: String,
      enum: ["teknik", "desain"],
      required: true,
    },
    angkatan: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 14,
      default: 1,
    },
    status: {
      type: String,
      enum: ["aktif", "cuti", "non-aktif", "lulus", "do"],
      default: "aktif",
    },
    alamat: {
      type: String,
      trim: true,
    },
    fotoProfil: {
      type: String, // path/URL ke file foto
      default: null,
    },
  },
  { timestamps: true }
);

mahasiswaSchema.index({ nama: "text", nrp: "text" });

export default mongoose.model("Mahasiswa", mahasiswaSchema);
