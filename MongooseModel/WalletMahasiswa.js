// Model wallet mahasiswa

const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const walletMahasiswaSchema = new mongoose.Schema({
    idMahasiswa: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      trim: true,
    },
    saldo: {
      type: Number,
      required: true,
      default: 0, // Mengatur saldo awal otomatis jadi 0 jika tidak diisi
      min: [0, 'Saldo tidak boleh minus!'] // Mencegah saldo bernilai negatif
    }
});
module.exports = mongoose.model('walletMahasiswa', walletMahasiswaSchema);