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
    reSeedAdmin()
    seederMongo()
    console.log("Koneksi ke server berhasil")
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
  const { DummyAlumni, DummyDosen, DummyProjectMahasiswa } = generateData(4)
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

// BRANCH INI KHUSUS UNTUK TEMPLATE AUTHORIZATION. ENDPOINT FPW ADA DI BRANCH FPW

// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))