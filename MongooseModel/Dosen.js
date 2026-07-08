// Model Dosen
// list dosen kampus
// { nid, nama, jabatan, prodi, fotoProfil }

const mongoose = require('mongoose');
const dosenSchema = new mongoose.Schema({
    nid: {
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
    jabatan: {
      type: String,
      required: true,
      trim: true,
    },
    prodi: {
      type: String,
      required: true,
      trim: true,
    },
    fotoProfil: {
      type: String,
      default: null
    }
});
module.exports = mongoose.model('Dosen', dosenSchema);