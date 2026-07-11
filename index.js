// SETUP AWAL YANG DIPERLUKAN
// (ubah kalau error / perlu banget)
// express
const express = require("express");
const app = express();
const port = 3000;
// mongodb
// bodyparser
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// multer & agen middleware upload
const multer = require("multer");
const path = require("path");
const multerStorageConf = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploadedFiles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: multerStorageConf });
// dotenv
require("dotenv").config();
// JWT
const jwt = require("jsonwebtoken");
// Mongoose
const mongoose = require("mongoose");
const urlDatabase = process.env.DATABASE_URL + "db_kampus_istts";
// Seeding dilakukan sesaat setelah mongoose terkoneksi (matikan seeding ketika tidak diperlukan)
mongoose
  .connect(urlDatabase)
  .then(() => {
    // NYALAKAN MATIKAN RESEEDER DISINI
    // seederMongo()
    // reSeedAdmin()
    console.log("Koneksi ke server mongodb berhasil");
  })
  .catch((err) => console.error("Koneksi gagal:", err));
// Mongoose ODM (ini untuk import model data)
const Alumni = require("./MongooseModel/Alumni");
const Dosen = require("./MongooseModel/Dosen");
const PendaftaranMaba = require("./MongooseModel/PendaftaranMaba");
const ProjectMahasiswa = require("./MongooseModel/ProjectMahasiswa");
const AdminUser = require("./MongooseModel/AdminUser");
const TransaksiPendaftaranMaba = require("./MongooseModel/TransaksiPendaftaranMaba");
const Mahasiswa = require("./MongooseModel/Mahasiswa")
const WalletMahasiswa = require("./MongooseModel/WalletMahasiswa")
// Mongoose seeder manual
async function seederMongo() {
  // hapus data dummy yang ada di server
  await Alumni.deleteMany({});
  await Dosen.deleteMany({});
  await ProjectMahasiswa.deleteMany({});
  await Mahasiswa.deleteMany({});
  await WalletMahasiswa.deleteMany({});
  // seeding
  const { generateData } = require("./MongooseSeeder/DummyData");
  // workaround faker biar ndak nyantol random state nya
  delete require.cache[require.resolve("./MongooseSeeder/DummyData")];
  const { DummyAlumni, DummyDosen, DummyProjectMahasiswa, DummyMahasiswa, DummyWalletMahasiswa } = generateData(3);
  await Alumni.insertMany(DummyAlumni);
  await Dosen.insertMany(DummyDosen);
  await ProjectMahasiswa.insertMany(DummyProjectMahasiswa);
  await Mahasiswa.insertMany(DummyMahasiswa);             // Tambahkan ini
  await WalletMahasiswa.insertMany(DummyWalletMahasiswa); // Tambahkan ini
  console.log("Seeder manual berhasil");
}
// *Seeder static khusus admin
async function reSeedAdmin() {
  await AdminUser.deleteMany({});
  const { SampleAdmin } = require("./MongooseSeeder/DummyData");
  await AdminUser.insertMany(SampleAdmin);
  console.log("HAII, admin users telah diseeding ulang");
}
// setup node mailer
const nodemailer = require('nodemailer');
// Setup transporter pembawa email (Fiture tambahan - Steven)
// Disini menggunakan layanan dari mailtrap sebagai dummy untuk prototyping
const Nodemailer = require("nodemailer");
const { MailtrapTransport } = require("mailtrap");
const TOKEN = process.env.TOKEN_MAILTRAP;
const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: TOKEN,
    sandbox: true,
    testInboxId: 4772803,
  })
);
// setup excelJS (Fitur tabahan - Steven)
const ExcelJS = require('exceljs');

// KODINGAN SEGALA MACAM DITARUH DI BAWAH

// Authorization thingies
// endpoint khusus untuk generasi JWT token dan digunakan via bearer token
app.get("/api/authorization/generateToken", async (req, res) => {
  const { username, password } = req.body;
  const userDitemukan = await AdminUser.findOne({
    userName: username,
    passwordHash: password,
  });
  console.log(userDitemukan);
  if (userDitemukan == null) {
    return res.status(403).json({
      Pesan: "Username/password salah",
    });
  }
  // kalau lolos baru buatkan tokennya
  const payload = {
    userName: username,
    role: userDitemukan.role,
    ObjectId: userDitemukan._id,
  };
  const hasilToken = jwt.sign(payload, process.env.SECRET_JWT, {
    expiresIn: "30d",
  });
  return res.status(200).json({
    Pesan: "Token bearer berhasil digenerasi",
    Bearer: hasilToken,
  });
});
// function khusus untuk middleware authorization
const middlewareAuth = (req, res, next) => {
  try {
    const ekstrakToken = req.headers.authorization;
    const splitToken = ekstrakToken.split(" ");
    const realToken = splitToken[1];
    console.log("real token ", realToken);
    const decodePayload = jwt.verify(realToken, process.env.SECRET_JWT);
    console.log("Hasil verifikasi", decodePayload);
    req.extractedRole = decodePayload.role;
    req.extractedObjectId = decodePayload.ObjectId;
    console.log(decodePayload.role, decodePayload.ObjectId);
    next();
  } catch (e) {
    // console.log(e);
    return res.status(403).json({
      Pesan: "Token tidak valid",
    });
  }
};
// function middleware ACL role admin
const { ACL } = require("./Authorization/ACL");
const aclRoleAdmin = (req, res, next) => {
  const hasilRole = req.extractedRole;
  var aclGetRole;
  var pathCocok;
  ACL.forEach((entry) => {
    if (entry.role == hasilRole) {
      aclGetRole = entry;
    }
  });
  console.log(aclGetRole);
  aclGetRole.path.forEach((elem) => {
    if (elem == req.route.path || elem == req.path || elem == "*") {
      pathCocok = true;
    }
  });
  if (pathCocok) {
    return next();
  }
  return res.status(403).json({
    Pesan: "Role anda tidak dapat mengakses endpoint ini",
  });
};

// STEVEN NICANOR XAVIER - 225011706
// get List dosen
app.get("/api/dosen/list", async (req, res) => {
  const listDosen = await Dosen.find();
  return res.status(200).json(listDosen);
});
// post dosen baru (all admin)
app.post(
  "/api/dosen/tambah",
  middlewareAuth,
  aclRoleAdmin,
  async (req, res) => {
    const { nid, nama, jabatan, prodi, fotoProfil } = req.body;
    try {
      const dosenBaru = await Dosen.insertOne({
        nid: nid,
        nama: nama,
        jabatan: jabatan,
        prodi: prodi,
        fotoProfil: fotoProfil,
      });
      return res.status(201).json({
        Pesan: "Dosen baru berhasil ditambahkan",
        data: dosenBaru,
      });
    } catch (e) {
      if (e.name == "ValidationError") {
        return res.status(400).json({
          Pesan: "Ada field diperlukan yang kosong/tidak valid",
        });
      } else {
        return res.status(500).json({
          Pesan: "Kesalahan tidak terduga pada server",
        });
      }
    }
  },
);
// put mengubah jabatan/prodi (all admin)
app.put(
  "/api/dosen/ubah_prodi_jabatan",
  middlewareAuth,
  aclRoleAdmin,
  async (req, res) => {
    const { nid } = req.query;
    const { jabatan, prodi } = req.body;
    console.log(nid, jabatan, prodi);
    // cari dulu dosennya
    const dosenDitemukan = await Dosen.findOne({
      nid: nid,
    });
    console.log(dosenDitemukan);
    if (dosenDitemukan == null) {
      return res.status(404).json({
        Pesan: "Dosen tersebut tidak tercatat",
      });
    }
    // kalau dia lolos sampai disini, lakukan pengubahan
    try {
      if (jabatan != "" && prodi != "") {
        const ubahProdiJabatan = await Dosen.updateOne(
          {
            nid: nid,
          },
          {
            jabatan: jabatan,
            prodi: prodi,
          },
        );
      } else if (jabatan != "") {
        const ubahJabatan = await Dosen.updateOne(
          {
            nid: nid,
          },
          {
            jabatan: jabatan,
          },
        );
      } else if (prodi != "") {
        const ubahProdi = await Dosen.updateOne(
          {
            nid: nid,
          },
          {
            prodi: prodi,
          },
        );
      }
      // deteksi apakah ada perubahan
      const newDosenState = await Dosen.findOne({
        nid: nid,
      });
      if (
        newDosenState.jabatan == dosenDitemukan.jabatan &&
        newDosenState.prodi == dosenDitemukan.prodi
      ) {
        return res.status(200).json({
          Pesan: "Tidak ada perubahan dilakukan",
        });
      } else {
        return res.status(200).json({
          Pesan: "Perubahan prodi/jabatan dosen berhasil dilakukan",
        });
      }
    } catch (e) {
      if (e.name == "ValidationError") {
        return res.status(400).json({
          Pesan: "Ada field yang kosong/tidak valid",
        });
      } else {
        return res.status(500).json({
          Pesan: "Ada error tidak terduga pada server",
        });
      }
    }
  },
);
// delete dosen (super admin only)
app.delete(
  "/api/dosen/hapus",
  middlewareAuth,
  aclRoleAdmin,
  async (req, res) => {
    const { nid } = req.query;
    const dosenDitemukan = await Dosen.findOne({
      nid: nid,
    });
    if (dosenDitemukan == null) {
      return res.status(404).json({
        Pesan: "Dosen dengan NID terkait tidak ditemukan",
      });
    }
    // kalau berhasil lolos, baru hapus dosen terkait
    const hapusDosen = await Dosen.deleteOne({
      nid: nid,
    });
    return res.status(200).json({
      Pesan: "Dosen sudah dihapus",
    });
  },
);

// 224011703 ALEXANDER GABRIEL EVAN
// get List pendaftaran maba
app.get('/api/registrasi/list', middlewareAuth, aclRoleAdmin, async (req, res) => {
  const listRegistrasiEntry = await PendaftaranMaba.find()
  return res.status(200).json(listRegistrasiEntry)
})
// download file xlsx
app.get('/api/registrasi/list/export', middlewareAuth, aclRoleAdmin, async (req, res) => {
  try {
    // 1. Tarik semua data dari collection pendaftaranmabas
    const listRegistrasi = await PendaftaranMaba.find();

    if (!listRegistrasi || listRegistrasi.length === 0) {
      return res.status(404).json({
        Pesan: "Tidak ada data pendaftaran maba yang bisa diekspor."
      });
    }

    // 2. Inisialisasi ExcelJS Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pendaftaran Maba');

    // 3. Setup Kolom berdasarkan property skema Mongoose kamu persis
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'ID Pendaftaran', key: '_id', width: 28 },
      { header: 'Nama Lengkap', key: 'namaLengkap', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'No HP', key: 'noHp', width: 15 },
      { header: 'Program Studi Pilihan', key: 'prodiPilihan', width: 30 }, // Diperlebar karena string enum lumayan panjang
      { header: 'Pesan', key: 'pesan', width: 30 },
      { header: 'Path File Ijazah', key: 'pathFileIjazah', width: 35 },  // Menyesuaikan field pathFileIjazah
      { header: 'Status Verifikasi', key: 'status', width: 15 }          // Menyesuaikan field status
    ];

    // 4. Looping data dan masukkan ke baris Excel
    listRegistrasi.forEach((maba, index) => {
      worksheet.addRow({
        no: index + 1,
        _id: maba._id.toString(), // Ambil _id bawaan MongoDB, ubah ke string
        namaLengkap: maba.namaLengkap,
        email: maba.email,
        noHp: maba.noHp,
        prodiPilihan: maba.prodiPilihan, // Mengisi nilai enum prodi
        pesan: maba.pesan || "",         // Mengikuti default skema kamu yaitu string kosong "" jika tidak diisi
        pathFileIjazah: maba.pathFileIjazah,
        status: maba.status              // Mengisi nilai enum status ("menunggu", "diverifikasi", "ditolak")
      });
    });

    // 5. Formatting Header (Baris Pertama) agar tebal (Bold)
    worksheet.getRow(1).font = { bold: true };

    // 6. Set HTTP Header untuk transfer file binary Excel (.xlsx)
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Data_Pendaftaran_Mabaru_${Date.now()}.xlsx"`
    );

    // 7. Alirkan data langsung sebagai response stream ke client
    await workbook.xlsx.write(res);
    return res.end();

    // ISI DARI LANGKAH 6 & 7 HARUS SEPERTI INI:
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // Pastikan menggunakan backtick ` dan di dalamnya ada tanda kutip ganda "
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Data_Pendaftar_Maba_${Date.now()}.xlsx"`
    );

    // HEADER TAMBAHAN UNTUK API CLIENT SEPERTI HOPPSCOTCH:
    res.setHeader(
      'X-Suggested-Filename',
      `Data_Pendaftar_Maba_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    return res.end();

  } catch (e) {
    console.error("Error saat export excel:", e);
    return res.status(500).json({
      Pesan: "Ada kesalahan tidak terduga pada server saat memproses file Excel"
    });
  }
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
    // kirimkan emailnya ke MailTrap via transporter
    // GUNAKAN 'transport' (sesuai nama variabel SDK Mailtrap Anda)
    const kirimMail = await transport.sendMail({
      from: {
        address: "admin@kampus-test.com",
        name: "Panitia PMB Kampus"
      },
      to: [email], // SDK Mailtrap biasanya meminta format Array [] untuk penerima
      subject: 'Pernyataan Pendaftaran Mahasiswa Baru Berhasil',
      // Gunakan properti html di sini
      html: `
        <h3>Halo, ${namaLengkap}!</h3>
        <p>Terima kasih telah melakukan registrasi online di sistem kami.</p>
        <p>Berikut adalah detail pendaftaran Anda:</p>
        <ul>
          <li><strong>Program Studi:</strong> ${prodiPilihan}</li>
          <li><strong>No. HP:</strong> ${noHp}</li>
        </ul>
        <p>Berkas ijazah Anda sedang dalam tahap verifikasi oleh tim administrasi.</p>
        <br>
        <p>Salam hangat,<br><strong>Panitia PMB</strong></p>
      `,
      category: "Pendaftaran Maba" // Fitur bawaan SDK Mailtrap
    });
    console.log("Mailtrap info:", kirimMail);
    return res.status(201).json({
      Pesan: "Entry pendaftaran telah dibuat"
    })
  } catch (e) {
    console.log(e)
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
  },
);
// put acc pada entry pendaftaran
app.put(
  "/api/registrasi/acc/:id",
  middlewareAuth,
  aclRoleAdmin,
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
      const logTransaksi = await TransaksiPendaftaranMaba.insertOne({
        idEntry: entryDitemukan._id,
        aksi: "diverifikasi",
        idAdmin: objectIdAdmin,
      });
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
// delete menolak entry pendaftaran
app.delete(
  "/api/registrasi/reject/:id",
  middlewareAuth,
  aclRoleAdmin,
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
      const logTransaksi = await TransaksiPendaftaranMaba.insertOne({
        idEntry: entryDitemukan._id,
        aksi: "ditolak",
        idAdmin: objectIdAdmin,
      });
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
// get transaksional acc dan penolakan
app.get("/api/registrasi/riwayatAksi", async (req, res) => {
  const tarikTransaksi = await TransaksiPendaftaranMaba.find();
  // ambil dulu siapa aja adminnya tidak boleh kembar
  const hasilAdminUnik = [];
  tarikTransaksi.forEach((element) => {
    // cek ke aray admin unik
    let isKembar = false;
    hasilAdminUnik.forEach((el) => {
      // kalau admin di transaksi ini kembar langsung matikan dengan is kembar
      if (el == element.idAdmin) {
        isKembar = true;
      }
    });
    // kalau belum ada di admin unik, tambahkan
    if (isKembar == false) {
      hasilAdminUnik.push(element.idAdmin);
    }
  });

  // dari setiap admin unik yang ditemukan, cari transaksinya. Rakit object JSON final
  const ArrObjectFinal = [];
  hasilAdminUnik.forEach((admin) => {
    // iterasi ke seluruh transaksi lagi untuk mencari transaksi terkait admin ini
    let tmpTransaksiAdmin = [];
    tarikTransaksi.forEach((e) => {
      if (e.idAdmin == admin) {
        tmpTransaksiAdmin.push({
          idEntry: e.idEntry,
          aksi: e.aksi,
        });
      }
    });
    // buat temporary object untuk dimasukkan ke object final
    let tmpObject = {
      idAdmin: admin,
      transaksi: tmpTransaksiAdmin,
    };
    ArrObjectFinal.push(tmpObject);
  });
  return res.status(200).json({
    Pesan:
      "Terdapat " +
      tarikTransaksi.length +
      " transaksi terhadap entry pendaftaran",
    Detail: ArrObjectFinal,
  });
});

// MICHAEL HERONIMUS
// project mahasiswa CRUD
// 1. Endpoint Baru: Mencari karya ilmiah/jurnal dari OpenAlex berdasarkan kata kunci/judul project
// Endpoint ini bersifat publik (bisa diakses siapa saja untuk mencari referensi akademik)
app.get("/api/projectmahasiswa/openalex/search", async (req, res) => {
  const { query } = req.query; // contoh: /api/projectmahasiswa/openalex/search?query=artificial intelligence

  if (!query) {
    return res.status(400).json({
      Pesan: "Parameter query pencarian tidak boleh kosong",
    });
  }
  try {
    // Memanggil OpenAlex API untuk mencari works (karya ilmiah)
    // Ditambahkan 'mailto' di query string sebagai bentuk 'polite pool' (sangat disarankan oleh OpenAlex)
    const openAlexUrl = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=5`;

    const response = await fetch(openAlexUrl, {
      headers: {
        "User-Agent": "MahasiswaCrudProject/1.0 (mailto:admin@istts.ac.id)",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        Pesan: "Gagal mengambil data dari OpenAlex API",
      });
    }

    const data = await response.json();

    // Mapping data mentah OpenAlex agar format JSON lebih bersih dan sesuai kebutuhan frontend
    const hasilSederhana = data.results.map((work) => ({
      idOpenAlex: work.id,
      judul: work.title,
      doi: work.doi,
      tahunPublikasi: work.publication_year,
      tipe: work.type,
      penulis: work.authorships
        ? work.authorships.map((a) => a.author.display_name)
        : [],
      institusi:
        work.authorships && work.authorships[0]?.institutions
          ? work.authorships[0].institutions.map((i) => i.display_name)
          : [],
    }));  
    return res.status(200).json({
      Pesan: `Berhasil mendapatkan ${hasilSederhana.length} referensi ilmiah dari OpenAlex`,
      totalHasil: data.meta.count,
      data: hasilSederhana,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      Pesan: "Ada kesalahan tidak terduga saat menghubungi OpenAlex API",
    });
  }
});

// end point list project mahasiswa dikeluarkan dari endpoint 3rd party open alex
app.get("/api/projectmahasiswa/list", async (req, res) => {
  const listProjectMhs = await ProjectMahasiswa.find();
  return res.status(200).json(listProjectMhs);
});

app.post(
  "/api/projectmahasiswa/tambah",
  middlewareAuth,
  aclRoleAdmin,
  async (req, res) => {
    const {
      judulProject,
      deskripsiSingkatProject,
      tagProject,
      prodi
    } = req.body;
    try {
      const projectBaru = await ProjectMahasiswa.create({
        judulProject,
        deskripsiSingkatProject,
        tagProject: Array.isArray(tagProject)
          ? tagProject
          : tagProject
            ? tagProject
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [],
        prodi,
      });
      return res.status(201).json({
        Pesan: "Project mahasiswa berhasil ditambahkan",
        data: projectBaru,
      });
    } catch (e) {
      if (e.name == "ValidationError") {
        return res.status(400).json({
          Pesan: "Ada field yang kosong/tidak valid",
        });
      }
      return res.status(500).json({
        Pesan: "Ada kesalahan tidak terduga pada server",
      });
    }
  },
);

app.put(
  "/api/projectmahasiswa/ubah/:id",
  middlewareAuth,
  aclRoleAdmin,
  async (req, res) => {
    const { id } = req.params;
    const {
      judulProject,
      deskripsiSingkatProject,
      tagProject,
      prodi,
    } = req.body;

    const projectDitemukan = await ProjectMahasiswa.findOne({ _id: id });
    if (projectDitemukan == null) {
      return res.status(404).json({
        Pesan: "Project mahasiswa tidak ditemukan",
      });
    }

    try {
      const payloadUpdate = {};
      if (judulProject !== undefined) payloadUpdate.judulProject = judulProject;
      if (deskripsiSingkatProject !== undefined)
        payloadUpdate.deskripsiSingkatProject = deskripsiSingkatProject;
      if (tagProject !== undefined)
        payloadUpdate.tagProject = Array.isArray(tagProject)
          ? tagProject
          : tagProject
            ? tagProject
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [];
      if (prodi !== undefined) payloadUpdate.prodi = prodi;

      if (Object.keys(payloadUpdate).length === 0) {
        return res.status(400).json({
          Pesan: "Tidak ada field yang dikirim untuk diubah",
        });
      }

      await ProjectMahasiswa.updateOne({ _id: id }, payloadUpdate);
      const projectTerbaru = await ProjectMahasiswa.findOne({ _id: id });
      return res.status(200).json({
        Pesan: "Project mahasiswa berhasil diperbarui",
        data: projectTerbaru,
      });
    } catch (e) {
      return res.status(500).json({
        Pesan: "Ada kesalahan tidak terduga pada server",
      });
    }
  },
);

app.delete(
  "/api/projectmahasiswa/hapus/:id",
  middlewareAuth,
  aclRoleAdmin,
  async (req, res) => {
    const { id } = req.params;
    const projectDitemukan = await ProjectMahasiswa.findOne({ _id: id });
    if (projectDitemukan == null) {
      return res.status(404).json({
        Pesan: "Project mahasiswa tidak ditemukan",
      });
    }

    await ProjectMahasiswa.deleteOne({ _id: id });
    return res.status(200).json({
      Pesan: "Project mahasiswa berhasil dihapus",
    });
  },
);

app.get("/api/mahasiswa/wallet/:idMahasiswa", async (req, res) => {
  const { idMahasiswa } = req.params;

  try {
    // Validasi apakah format ObjectId valid agar server tidak crash
    if (!mongoose.Types.ObjectId.isValid(idMahasiswa)) {
      return res.status(400).json({ Pesan: "Format ID Mahasiswa tidak valid" });
    }

    // Cari wallet berdasarkan idMahasiswa
    const wallet = await WalletMahasiswa.findOne({ idMahasiswa: idMahasiswa });
    if (!wallet) {
      return res.status(404).json({ Pesan: "Wallet untuk mahasiswa ini tidak ditemukan" });
    }

    // Cari profil mahasiswanya sekalian untuk informasi nama & nrp
    const mhs = await Mahasiswa.findById(idMahasiswa);

    return res.status(200).json({
      Pesan: "Berhasil mendapatkan data saldo",
      data: {
        idMahasiswa: wallet.idMahasiswa,
        namaMahasiswa: mhs ? mhs.namaMahasiswa : "Nama tidak diketahui",
        nrpMahasiswa: mhs ? mhs.nrpMahasiswa : "-",
        saldo: wallet.saldo
      }
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ Pesan: "Ada kesalahan tidak terduga pada server" });
  }
});

// 2. Endpoint untuk mengisi (top up) saldo mahasiswa berdasarkan ID object mahasiswa
app.put("/api/mahasiswa/wallet/topup", middlewareAuth, aclRoleAdmin, async (req, res) => {
  const { idMahasiswa, jumlah } = req.body;
  if (!idMahasiswa || jumlah === undefined) {
    return res.status(400).json({ Pesan: "Field idMahasiswa dan jumlah wajib diisi" });
  }

  const nominal = Number(jumlah);
  if (isNaN(nominal) || nominal <= 0) {
    return res.status(400).json({ Pesan: "Jumlah top up harus berupa angka dan lebih besar dari 0" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(idMahasiswa)) {
      return res.status(400).json({ Pesan: "Format ID Mahasiswa tidak valid" });
    }

    // Gunakan $inc (increment) untuk menjumlahkan saldo secara atomis di MongoDB
    const walletTerupdate = await WalletMahasiswa.findOneAndUpdate(
      { idMahasiswa: idMahasiswa },
      { $inc: { saldo: nominal } }, // ini workaround di racae condition dimana 2 saldo masuk bareng
      { new: true, runValidators: true } // new: true mengembalikan data setelah di-update
    );

    if (!walletTerupdate) {
      return res.status(404).json({ Pesan: "Wallet tidak ditemukan, top up gagal" });
    }

    return res.status(200).json({
      Pesan: "Top up saldo berhasil",
      saldoTerbaru: walletTerupdate.saldo
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ Pesan: "Ada kesalahan tidak terduga pada server" });
  }
});

// 3. Endpoint untuk mengurangi saldo mahasiswa berdasarkan ID object mahasiswa
app.put("/api/mahasiswa/wallet/pay", async (req, res) => {
  const { idMahasiswa, jumlah } = req.body;

  if (!idMahasiswa || jumlah === undefined) {
    return res.status(400).json({ Pesan: "Field idMahasiswa dan jumlah wajib diisi" });
  }

  const nominal = Number(jumlah);
  if (isNaN(nominal) || nominal <= 0) {
    return res.status(400).json({ Pesan: "Jumlah pengurangan harus berupa angka dan lebih besar dari 0" });
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(idMahasiswa)) {
      return res.status(400).json({ Pesan: "Format ID Mahasiswa tidak valid" });
    }

    // Ambil data wallet terlebih dahulu untuk cek kecukupan saldo
    const wallet = await WalletMahasiswa.findOne({ idMahasiswa: idMahasiswa });
    if (!wallet) {
      return res.status(404).json({ Pesan: "Wallet tidak ditemukan" });
    }

    // Validasi manual agar tidak melanggar aturan min: 0 di Schema Mongoose Anda
    if (wallet.saldo - nominal < 0) {
      return res.status(400).json({ 
        Pesan: "Transaksi gagal, saldo tidak mencukupi!", 
        saldoSekarang: wallet.saldo 
      });
    }

    // Kurangi saldo dengan memberikan nilai negatif ke operator $inc
    const walletTerupdate = await WalletMahasiswa.findOneAndUpdate(
      { idMahasiswa: idMahasiswa },
      { $inc: { saldo: -nominal } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      Pesan: "Pengurangan saldo berhasil",
      saldoTerbaru: walletTerupdate.saldo
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ Pesan: "Ada kesalahan tidak terduga pada server" });
  }
});

// STARTER SERVER EXPRESS
// ubah port di atas kalau ada error tabrakan port
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
