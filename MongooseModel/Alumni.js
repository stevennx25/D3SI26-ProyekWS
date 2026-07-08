// Model alumni
// untuk listting alumni lulusan
// {nrp, nama, email, noHp, prodi, fakultas, angkatan, tahunLulus, pekerjaan, perusahaan, testimoni, linkedin, fotoProfil}

// trim digunakan untuk membersihkan typo spasi pojok awal dan akhir otomatis

const mongoose = require('mongoose');
const alumniSchema = new mongoose.Schema({
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
      trim: true
    },
    perusahaan: {
      type: String,
      trim: true
    },
    testimoni: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    fotoProfil: {
      type: String,
      default: null
    }
});
module.exports = mongoose.model('Alumni', alumniSchema);