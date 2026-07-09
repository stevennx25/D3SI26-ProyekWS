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
const TransaksiPendaftaranMaba = require("./MongooseModel/TransaksiPendaftaranMaba")
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
    role: userDitemukan.role,
    ObjectId: userDitemukan._id
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
    console.log("real token ", realToken)
    const decodePayload = jwt.verify(realToken, process.env.SECRET_JWT)
    console.log("Hasil verifikasi", decodePayload)
    req.extractedRole = decodePayload.role
    req.extractedObjectId = decodePayload.ObjectId
    console.log(decodePayload.role, decodePayload.ObjectId)
    next()
  } catch (e) {
    console.log(e)
    return res.status(403).json({
      Pesan: "Token tidak valid"
    })
  }
}
// function middleware ACL role admin
const { ACL } = require("./Authorization/ACL")
const aclRoleAdmin = (req, res, next) => {
  const hasilRole = req.extractedRole
  var aclGetRole
  var pathCocok
  ACL.forEach(entry => {
    if (entry.role == hasilRole) {
      aclGetRole = entry
    }
  });
  console.log(aclGetRole)
  aclGetRole.path.forEach(elem => {
    if(elem == req.route.path || elem == req.path || elem == "*") {
      pathCocok = true
    }
  });
  if (pathCocok) {
    return next()
  }
  return res.status(403).json({
    Pesan: "Role anda tidak dapat mengakses endpoint ini"
  })
}


// STEVEN NICANOR XAVIER - 225011706
// get List dosen
app.get('/api/dosen/list', async (req, res) => {
  const listDosen = await Dosen.find()
  return res.status(200).json(listDosen)
})
// post dosen baru (all admin)
app.post('/api/dosen/tambah', middlewareAuth, aclRoleAdmin, async (req, res) => {
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
// put mengubah jabatan/prodi (all admin)
app.put('/api/dosen/ubah_prodi_jabatan', middlewareAuth, aclRoleAdmin, async (req, res) => {

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
    if (jabatan != "" && prodi != "") {
      const ubahProdiJabatan = await Dosen.updateOne({
        nid: nid
      }, {
        jabatan: jabatan,
        prodi: prodi
      })
    } else if (jabatan != "") {
      const ubahJabatan = await Dosen.updateOne({
        nid: nid
      }, {
        jabatan: jabatan
      })
    } else if (prodi != "") {
      const ubahProdi = await Dosen.updateOne({
        nid: nid
      }, {
        prodi: prodi
      })
    }
    // deteksi apakah ada perubahan 
    const newDosenState = await Dosen.findOne(
      {
        nid: nid
      }
    )
    if (newDosenState.jabatan == dosenDitemukan.jabatan && newDosenState.prodi == dosenDitemukan.prodi) {
      return res.status(200).json({
        Pesan: "Tidak ada perubahan dilakukan"
      })
    } else {
      return res.status(200).json({
        Pesan: "Perubahan prodi/jabatan dosen berhasil dilakukan"
      })
    }
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
// delete dosen (super admin only)
app.delete('/api/dosen/hapus', middlewareAuth, aclRoleAdmin, async (req, res) => {
  const { nid } = req.query;
  const dosenDitemukan = await Dosen.findOne({
    nid: nid
  })
  if (dosenDitemukan == null) {
    return res.status(404).json({
      Pesan: "Dosen dengan NID terkait tidak ditemukan"
    })
  }
  // kalau berhasil lolos, baru hapus dosen terkait
  const hapusDosen = await Dosen.deleteOne({
    nid: nid
  })
  return res.status(200).json({
    Pesan: "Dosen sudah dihapus"
  })
});

// 224011703 ALEXANDER GABRIEL EVAN
// get List pendaftaran maba
app.get('/api/registrasi/list', middlewareAuth, aclRoleAdmin, async (req, res) => {
  const listRegistrasiEntry = await PendaftaranMaba.find()
  return res.status(200).json(listRegistrasiEntry)
})
// post entry pendaftaran baru
app.post('/api/registrasi/new', upload.single("scanIjazah"), async (req, res) => {
  const { namaLengkap, email, noHp, prodiPilihan, pesan } = req.body
  const fileIjazah = req.file
  try {
    // Workaround path bawaan multer
    const pathAman = req.file.path.replace(/\\/g, '/');
    console.log(fileIjazah, pathAman)
    const tambahEntryRegMaba = await PendaftaranMaba.insertOne({
      namaLengkap: namaLengkap,
      email: email,
      noHp: noHp,
      prodiPilihan: prodiPilihan,
      pesan: pesan,
      pathFileIjazah: pathAman
    })
    return res.status(201).json({
      Pesan: "Entry pendaftaran telah dibuat"
    })
  } catch (e) {
    if (e.name == "ValidationError") {
      console.log(e)
      return res.status(400).json({
        Pesan: "Ada field kosong/tidak valid"
      })
    } else {
      return res.status(500).json({
        Pesan: "Ada masalah tidak terduga pada server"
      })
    }
  }
})
// put acc pada entry pendaftaran
app.put('/api/registrasi/acc/:id', middlewareAuth, aclRoleAdmin, async (req, res) => {
  const objectIdAdmin = req.extractedObjectId
  console.log(objectIdAdmin)
  const id = req.params.id
  const entryDitemukan = await PendaftaranMaba.findOne({
    _id: id
  })
  if (entryDitemukan == null) {
    return res.status(404).json({
      Pesan: "Entry ini tidak ditemukan"
    })
  }
  if (entryDitemukan.status == "menunggu") {
    const accEntry = await PendaftaranMaba.updateOne({
      _id: id
    }, {
      status: "diverifikasi"
    })
    const logTransaksi = await TransaksiPendaftaranMaba.insertOne({
      idEntry: entryDitemukan._id,
      status: "diverifikasi",
      idAdmin: objectIdAdmin
    })
    return res.status(200).json({
      Pesan: "Entri pendaftaran telah diverifikasi"
    })
  } else {
    return res.status(200).json({
      Pesan: "Entry telah diverifikasi sebelumnya"
    })
  }
});
// delete menolak entry pendaftaran
app.delete('/api/registrasi/reject/:id', middlewareAuth, aclRoleAdmin, async (req, res) => {
  const objectIdAdmin = req.extractedObjectId
  const id = req.params.id
  const entryDitemukan = await PendaftaranMaba.findOne({
    _id: id
  })
  if (entryDitemukan == null) {
    return res.status(404).json({
      Pesan: "Entry ini tidak ditemukan"
    })
  }
  if (entryDitemukan.status == "menunggu") {
    const accEntry = await PendaftaranMaba.updateOne({
      _id: id
    }, {
      status: "ditolak"
    })
    const logTransaksi = await TransaksiPendaftaranMaba.insertOne({
      idEntry: entryDitemukan._id,
      status: "ditolak",
      idAdmin: objectIdAdmin
    })
    return res.status(200).json({
      Pesan: "Entri pendaftaran telah ditolak"
    })
  } else if (entryDitemukan.status == "diverifikasi") {
    return res.status(409).json({
      Pesan: "Entry sudah terverifikasi tidak dapat ditolak"
    })
  } else {
    return res.status(200).json({
      Pesan: "Entry sudah ditolak sebelumnya"
    })
  }
});
// get transaksional acc dan penolakan
app.get('/api/registrasi/riwayatAksi', async (req, res) => {
  const tarikTransaksi = await TransaksiPendaftaranMaba.find()
  // ambil dulu siapa aja adminnya tidak boleh kembar
  const hasilAdminUnik = []
  tarikTransaksi.forEach(element => {
    // cek ke aray admin unik
    let isKembar = false
    hasilAdminUnik.forEach(el => {
      // kalau admin di transaksi ini kembar langsung matikan dengan is kembar
      if (el == element.idAdmin) {
        isKembar = true
      }
    });
    // kalau belum ada di admin unik, tambahkan
    if (isKembar == false) {
      hasilAdminUnik.push(element.idAdmin)
    }
  });

  // dari setiap admin unik yang ditemukan, cari transaksinya. Rakit object JSON final
  const ArrObjectFinal = []
  hasilAdminUnik.forEach (admin => {
    // iterasi ke seluruh transaksi lagi untuk mencari transaksi terkait admin ini
    let tmpTransaksiAdmin = []
    tarikTransaksi.forEach(e => {
      if (e.idAdmin == admin) {
        tmpTransaksiAdmin.push({
          idEntry: e.idEntry,
          aksi: e.aksi
        })
      }
    })
    // buat temporary object untuk dimasukkan ke object final
    let tmpObject = { 
      idAdmin: admin, 
      transaksi: tmpTransaksiAdmin 
    }
    ArrObjectFinal.push(tmpObject)
  })
  return res.status(200).json({
    Pesan: "Terdapat " + tarikTransaksi.length + " transaksi terhadap entry pendaftaran",
    Detail: ArrObjectFinal
  })
})


// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`))