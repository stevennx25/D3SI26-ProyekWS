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
    },
    pesan: {
      type: String,
      trim: true,
      default: "",
    },
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
    }
});
module.exports = mongoose.model('PendaftaranMaba', pendaftaranMabaSchema);