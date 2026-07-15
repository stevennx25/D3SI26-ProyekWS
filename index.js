// SETUP AWAL YANG DIPERLUKAN
// (ubah kalau error / perlu banget)
// express
const express = require('express')
const app = express()
const port = 3000
// mongodb
// bodyparser
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// multer & agen middleware upload
const multer = require('multer');
const path = require('path');
const multerStorageConf = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploadedFiles');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: multerStorageConf });
// dotenv
require('dotenv').config();
// JWT
const jwt = require('jsonwebtoken');
// Mongoose
const mongoose = require('mongoose');
const urlDatabase = process.env.DATABASE_URL + "db_kampus_istts"; 
mongoose.connect(urlDatabase)
  .then(() => {
    // seederMongo()
    console.log("Koneksi ke server berhasil dan data berhasil di seeding")
  })
  .catch((err) => console.error('Koneksi gagal:', err));
// Mongoose ODM (ini untuk import model data)
const Alumni = require("./MongooseModel/Alumni")
const Dosen = require("./MongooseModel/Dosen")
const PendaftaranMaba = require("./MongooseModel/PendaftaranMaba")
const ProjectMahasiswa = require("./MongooseModel/ProjectMahasiswa")
// Mongoose seeder manual
async function seederMongo() {
  console.log("Seeder manual dijalankan")
  // hapus data dummy yang ada di server
  await Alumni.deleteMany({})
  await Dosen.deleteMany({})
  await ProjectMahasiswa.deleteMany({})
  // seeding
  const { generateData } = require("./MongooseSeeder/DummyData")
  // workaround faker biar ndak nyantol random state nya
  delete require.cache[require.resolve("./MongooseSeeder/DummyData")];
  const { DummyAlumni, DummyDosen, DummyProjectMahasiswa } = generateData(40)
  await Alumni.insertMany(DummyAlumni)
  await Dosen.insertMany(DummyDosen)
  await ProjectMahasiswa.insertMany(DummyProjectMahasiswa)
}
// CORS
const cors = require('cors');
// Izinkan semua origin, atau tentukan port react Anda
app.use(cors({
  origin: 'http://localhost:5173' // Sesuaikan dengan URL React Anda
}));

// KODINGAN SEGALA MACAM DITARUH DI BAWAH

// Endpoint khusus FPW
// get List dosen
app.get('/api/react/dosen/list', async (req, res) => {
  const listDosen = await Dosen.find()
  return res.status(200).json(listDosen)
})
// get List alumni
app.get('/api/react/alumni/list', async (req, res) => {
  const listAlumni = await Alumni.find()
  return res.status(200).json(listAlumni)
})
// get List pendaftaran maba
app.get('/api/react/registrasi/list', async (req, res) => {
  const listRegistrasiEntry = await PendaftaranMaba.find()
  return res.status(200).json(listRegistrasiEntry)
})
// Post entry pendfataran maba
app.post('/api/react/registrasi/baru', async (req, res) => {
  const { nama_lengkap, no_hp, email, prodi_pilihan, pesan } = req.body
  try {
    const daftarkanMaba = await PendaftaranMaba.insertOne(
      {
        namaLengkap: nama_lengkap,
        noHp: no_hp,
        email: email,
        pesan: pesan,
        prodiPilihan: prodi_pilihan,
        fileIjazah: "Path/Ke/Ijazah"
      }
    )
    console.log(daftarkanMaba)
    return res.status(201).json({
      Pesan: "Berhasil mendaftarkan calon pendaftar baru"
    })
  } catch (e) {
    if (e.name == 'ValidationError') {
      return res.status(400).json({
        Pesan: "Ada field yang kosong yang diperlukan"
      })
    } else {
      return res.status(500).json({
        Pesan: "Gagal mendaftarkan mahasiswa baru karena kesalahan server"
      })
    }
  }
})
// get List project mahasiswa
app.get('/api/react/projectmhs/list', async (req, res) => {
  const listProjectMhs = await ProjectMahasiswa.find()
  return res.status(200).json(listProjectMhs)
})
// registrasi entry pendaftaran
app.put(
  "/api/registrasi/acc/:id",
  async (req, res) => {
    const objectIdAdmin = req.extractedObjectId;
    console.log(objectIdAdmin);
    const id = req.params.id;
    const entryDitemukan = await PendaftaranMaba.findOne({
      _id: id,
    });
    if (entryDitemukan == null) {
      return res.status(404).json({
        Pesan: "Entry ini tidak ditemukan",
      });
    }
    if (entryDitemukan.status == "menunggu") {
      const accEntry = await PendaftaranMaba.updateOne(
        {
          _id: id,
        },
        {
          status: "diverifikasi",
        },
      );
      return res.status(200).json({
        Pesan: "Entri pendaftaran telah diverifikasi",
      });
    } else {
      return res.status(200).json({
        Pesan: "Entry telah diverifikasi sebelumnya",
      });
    }
  },
);
app.delete(
  "/api/registrasi/reject/:id",
  async (req, res) => {
    const objectIdAdmin = req.extractedObjectId;
    const id = req.params.id;
    const entryDitemukan = await PendaftaranMaba.findOne({
      _id: id,
    });
    if (entryDitemukan == null) {
      return res.status(404).json({
        Pesan: "Entry ini tidak ditemukan",
      });
    }
    if (entryDitemukan.status == "menunggu") {
      const accEntry = await PendaftaranMaba.updateOne(
        {
          _id: id,
        },
        {
          status: "ditolak",
        },
      );
      return res.status(200).json({
        Pesan: "Entri pendaftaran telah ditolak",
      });
    } else if (entryDitemukan.status == "diverifikasi") {
      return res.status(409).json({
        Pesan: "Entry sudah terverifikasi tidak dapat ditolak",
      });
    } else {
      return res.status(200).json({
        Pesan: "Entry sudah ditolak sebelumnya",
      });
    }
  },
);

// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))