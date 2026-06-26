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

// KODINGAN SEGALA MACAM DITARUH DI BAWAH

// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))