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
    seederMongo()
    console.log("Koneksi ke server berhasil dan data berhasil di seeding")
  })
  .catch((err) => console.error('Koneksi gagal:', err));
// Mongoose ODM (ini untuk import model data)
const Alumni = require("./MongooseModel/Alumni")
const Dosen = require("./MongooseModel/Dosen")
const PendaftaranMaba = require("./MongooseModel/PendaftaranMaba")
// Mongoose seeder manual
async function seederMongo() {
  console.log("Seeder manual dijalankan")
  // hapus data dummy yang ada di server
  await Alumni.deleteMany({})
  await Dosen.deleteMany({})
  // seeding
  const { generateData } = require("./MongooseSeeder/DummyData")
  // workaround faker biar ndak nyantol random state nya
  delete require.cache[require.resolve("./MongooseSeeder/DummyData")];
  const { DummyAlumni, DummyDosen } = generateData(10)
  await Alumni.insertMany(DummyAlumni)
  await Dosen.insertMany(DummyDosen)
}

// KODINGAN SEGALA MACAM DITARUH DI BAWAH

// Endpoint khusus FPW
// List dosen
app.get('/api/react/dosen/list', async (req, res) => {
  const listDosen = await Dosen.find()
  return res.status(200).json(listDosen)
})
// List alumni
app.get('/api/react/alumni/list', async (req, res) => {
  const listAlumni = await Alumni.find()
  return res.status(200).json(listAlumni)
})

// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))