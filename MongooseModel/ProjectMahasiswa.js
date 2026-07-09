// Model PendaftaranMaba
// untuk simpan listing pendaftaran maba oleh customer
// { namaLengkap, email, noHp, prodiPilihan, pesan, fileIjazah, namaFileAsli, status }

const mongoose = require('mongoose');
const projectMahasiswaSchema = new mongoose.Schema({
    judulProject: {
      type: String,
      required: true,
      trim: true,
    },
    deskripsiSingkatProject: {
      type: String,
      trim: true,
      default: "(Tidak ada deskripsi)"
    },
    tagProject: {
      type: [{
        type: String,
        trim: true
      }],
      default: null
    },
    prodi: {
      type: String,
      default: "Umum",
      trim: true,
    },
    pathFotoSampul: {
      type: String,
      default: null,
      trim: true
    }
});
module.exports = mongoose.model('ProjectMahasiswa', projectMahasiswaSchema);