import mongoose from "mongoose";

const pendaftaranSchema = new mongoose.Schema(
  {
    namaLengkap: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    noHp: {
      type: String,
      required: true,
      trim: true,
    },
    prodiPilihan: {
      type: String,
      required: true,
      trim: true,
    },
    pesan: {
      type: String,
      trim: true,
      default: "",
    },
    // path relatif ke file ijazah yang diupload, contoh: /uploads/ijazah/167890-ijazah.pdf
    fileIjazah: {
      type: String,
      required: true,
    },
    namaFileAsli: {
      type: String,
    },
    status: {
      type: String,
      enum: ["menunggu", "diverifikasi", "ditolak"],
      default: "menunggu",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pendaftaran", pendaftaranSchema);
