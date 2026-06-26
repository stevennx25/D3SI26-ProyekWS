import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
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
      trim: true,
    },
    prodi: {
      type: String,
      required: true,
      trim: true,
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
    tahunLulus: {
      type: Number,
      required: true,
    },
    pekerjaan: {
      type: String,
      trim: true,
      // contoh: "Software Engineer"
    },
    perusahaan: {
      type: String,
      trim: true,
      // contoh: "Google"
    },
    testimoni: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    fotoProfil: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

alumniSchema.index({ nama: "text", nrp: "text", perusahaan: "text" });

export default mongoose.model("Alumni", alumniSchema);
