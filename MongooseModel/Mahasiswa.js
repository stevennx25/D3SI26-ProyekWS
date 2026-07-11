// Model wallet mahasiswa

const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const mahasiswaSchema = new mongoose.Schema({
    namaMahasiswa: {
      type: String,
      required: true,
      trim: true,
    },
    nrpMahasiswa: {
      type: String,
      required: true
    }
});
module.exports = mongoose.model('mahasiswa', mahasiswaSchema);