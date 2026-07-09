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
// Seeding dilakukan sesaat setelah mongoose terkoneksi (matikan seeding ketika tidak diperlukan)
mongoose.connect(urlDatabase)
  .then(() => {
    // seederMongo()
    // reSeedAdmin()
    console.log("Koneksi ke server mongodb berhasil")
  })
  .catch((err) => console.error('Koneksi gagal:', err));
// Mongoose ODM (ini untuk import model data)
const Alumni = require("./MongooseModel/Alumni")
const Dosen = require("./MongooseModel/Dosen")
const PendaftaranMaba = require("./MongooseModel/PendaftaranMaba")
const ProjectMahasiswa = require("./MongooseModel/ProjectMahasiswa")
const AdminUser = require("./MongooseModel/AdminUser")
// Mongoose seeder manual
async function seederMongo() {
  // hapus data dummy yang ada di server
  await Alumni.deleteMany({})
  await Dosen.deleteMany({})
  await ProjectMahasiswa.deleteMany({})
  // seeding
  const { generateData } = require("./MongooseSeeder/DummyData")
  // workaround faker biar ndak nyantol random state nya
  delete require.cache[require.resolve("./MongooseSeeder/DummyData")];
  const { DummyAlumni, DummyDosen, DummyProjectMahasiswa } = generateData(3)
  await Alumni.insertMany(DummyAlumni)
  await Dosen.insertMany(DummyDosen)
  await ProjectMahasiswa.insertMany(DummyProjectMahasiswa)
  console.log("Seeder manual berhasil")
}
// *Seeder static khusus admin
async function reSeedAdmin() {
  await AdminUser.deleteMany({})
  const { SampleAdmin } = require("./MongooseSeeder/DummyData")
  await AdminUser.insertMany(SampleAdmin)
  console.log("HAII, admin users telah diseeding ulang")
}

// KODINGAN SEGALA MACAM DITARUH DI BAWAH

// Rencana nya
/*
projectmahasiswas
get - ambil list project mahasiswa
post - tambah project mahasiswa (admin only, pakai middleware)
put - tambah tag project (admin only, middleware)
delete/ObjectId - hapus project mahasiswa berdasar id (admin only, middleware)

dosens
get - ambil list dosen
post - tambah dosen (admin only, pakai middleware)
put - ubah matkul/prodi ampuan dosen (admin only, middleware)
delete/ObjectId - hapus dosen (admin only, middleware)

alumnis
get - ambil list alumni
post - tambah alumni (admin only, middleware)
put - 
delete - hapus alumni

pendaftaranmabas
get - ambil list entri pendaftaran
post - buat entry pendaftaran baru (upload ijazah pakai multer)
put - acc entry pendaftaran
delete - hapus entry pendaftaran yang invalid (admin only, middleware)
*/
// xander ambil pendaftaran mabas, steven ambil dosens
// michael ambil ??

// endpoint bekas project FPW buatan steven yang free diambil
// get List project mahasiswa
app.get('/api/react/projectmhs/list', async (req, res) => {
  const listProjectMhs = await ProjectMahasiswa.find()
  return res.status(200).json(listProjectMhs)
})
// get List alumni
app.get('/api/react/alumni/list', async (req, res) => {
  const listAlumni = await Alumni.find()
  return res.status(200).json(listAlumni)
})

// Authorization thingies
// endpoint khusus untuk generasi JWT token dan digunakan via bearer token
app.get('/api/authorization/generateToken', async (req, res) => {
  const { username, password } = req.body
  const userDitemukan = await AdminUser.findOne({
    userName: username,
    passwordHash: password
  })
  console.log(userDitemukan)
  if (userDitemukan == null) {
    return res.status(403).json({
      Pesan: "Username/password salah"
    })
  }
  // kalau lolos baru buatkan tokennya
  const payload = {
    userName: username,
    role: userDitemukan.role
  }
  const hasilToken = jwt.sign(payload, process.env.SECRET_JWT, {
    expiresIn: "30d"
  })
  return res.status(200).json({
    Pesan: "Token bearer berhasil digenerasi",
    Bearer: hasilToken
  })
})
// function khusus untuk middleware authorization
const middlewareAuth = (req, res, next) => {
  try {
    const ekstrakToken = req.headers.authorization
    const splitToken = ekstrakToken.split(" ")
    const realToken = splitToken[1]
    const decodePayload = jwt.verify(realToken, process.env.SECRET_JWT)
    console.log(decodePayload)
    next()
  } catch (e) {
    return res.status(403).json({
      Pesan: "Token tidak valid"
    })
  }
}


// STEVEN NICANOR XAVIER - 225011706
// get List dosen
app.get('/api/dosen/list', async (req, res) => {
  const listDosen = await Dosen.find()
  return res.status(200).json(listDosen)
})
// post dosen baru (admin standard only via middleware authentication)
app.post('/api/dosen/tambah', async (req, res) => {
  const { nid, nama, jabatan, prodi, fotoProfil } = req.body
  try {
    const dosenBaru = await Dosen.insertOne({
      nid: nid,
      nama: nama,
      jabatan: jabatan,
      prodi: prodi,
      fotoProfil: fotoProfil
    })
    return res.status(201).json({
      Pesan: "Dosen baru berhasil ditambahkan",
      data: dosenBaru
    })
  } catch (e) {
    if (e.name == "ValidationError") {
      return res.status(400).json({
        Pesan: "Ada field diperlukan yang kosong/tidak valid"
      })
    } else {
      return res.status(500).json({
        Pesan: "Kesalahan tidak terduga pada server"
      })
    }
  }
})
// put mengubah jabatan/prodi
app.put('/api/dosen/ubah_prodi_jabatan', async (req, res) => {
  const { nid } = req.query;
  const { jabatan, prodi } = req.body;
  console.log(nid, jabatan, prodi)
  // cari dulu dosennya
  const dosenDitemukan = await Dosen.findOne({
    nid: nid
  })
  console.log(dosenDitemukan)
  if (dosenDitemukan == null) {
    return res.status(404).json({
      Pesan: "Dosen tersebut tidak tercatat"
    })
  }
  // kalau dia lolos sampai disini, lakukan pengubahan
  try {
    if (jabatan != "", prodi != "") {
      const ubahProdiJabatan = await Dosen.updateOne({
        nid: nid
      }, {
        jabatan: jabatan
      })
    } else if (jabatan != "") {
      const ubahJabatan = await Dosen.updateOne({
        nid: nid
      }, {
        jabatan: jabatan
      })
    } else if (prodi != "") {
      const ubahProdi = await Dosen.updateOne({
        prodi: prodi
      })
    }
    return res.status(200).json({})
  } catch (e) {
    if (e.name == "ValidationError") {
      return res.status(400).json({
        Pesan: "Ada field yang kosong/tidak valid"
      })
    } else {
      return res.status(500).json({
        Pesan: "Ada error tidak terduga pada server"
      })
    }
  }
});

// 224011703 ALEXANDER GABRIEL EVAN
// get List pendaftaran maba
app.get('/api/react/registrasi/list', async (req, res) => {
  const listRegistrasiEntry = await PendaftaranMaba.find()
  return res.status(200).json(listRegistrasiEntry)
})

// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))