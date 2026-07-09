// Model PendaftaranMaba
// untuk simpan listing pendaftaran maba oleh customer
// { namaLengkap, email, noHp, prodiPilihan, pesan, fileIjazah, namaFileAsli, status }

const mongoose = require('mongoose');
const pendaftaranMabaSchema = new mongoose.Schema({
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
      enum: ["S1 - Informatika", "D3 - Sistem Informasi", "S1 - Desain Komunikasi Visual", "S1 - Sistem Informasi Bisnis", "S1 - Desain Produk", "S1 - Manajemen Bisnis Digital"]
    },
    pesan: {
      type: String,
      trim: true,
      default: "",
    },
    pathFileIjazah: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["menunggu", "diverifikasi", "ditolak"],
      default: "menunggu",
    }
});
module.exports = mongoose.model('PendaftaranMaba', pendaftaranMabaSchema);