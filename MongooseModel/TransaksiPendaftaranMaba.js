// Model transaksi pendaftaran maba

const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const transaksiPendaftaranMabaSchema = new mongoose.Schema({
    idEntry: {
      type: ObjectId,
      required: true,
      trim: true,
    },
    aksi: {
      type: String,
      enum: ["menunggu", "diverifikasi", "ditolak"]  
    },
    idAdmin: {
      type: ObjectId,
      required: true,
      trim: true
    }
});
module.exports = mongoose.model('transaksiPendaftaranMaba', transaksiPendaftaranMabaSchema);