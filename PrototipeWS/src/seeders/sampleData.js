import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Mahasiswa from "../models/Mahasiswa.js";
import Alumni from "../models/Alumni.js";

const dummyMahasiswa = [
  {
    nrp: "225011701",
    nama: "Budi Santoso",
    email: "budi.santoso@student.istts.ac.id",
    noHp: "081234567801",
    prodi: "S1 Teknik Informatika",
    fakultas: "teknik",
    angkatan: 2022,
    semester: 7,
    status: "aktif",
  },
  {
    nrp: "225011702",
    nama: "Siti Aminah",
    email: "siti.aminah@student.istts.ac.id",
    noHp: "081234567802",
    prodi: "D3 Manajemen Informatika",
    fakultas: "teknik",
    angkatan: 2023,
    semester: 5,
    status: "aktif",
  },
  {
    nrp: "225011703",
    nama: "Andi Pratama",
    email: "andi.pratama@student.istts.ac.id",
    noHp: "081234567803",
    prodi: "S1 Desain Komunikasi Visual",
    fakultas: "desain",
    angkatan: 2021,
    semester: 9,
    status: "cuti",
  },
];

const dummyAlumni = [
  {
    nrp: "215011601",
    nama: "Rizky Hermawan",
    email: "rizky.hermawan@gmail.com",
    noHp: "081234567901",
    prodi: "S1 Teknik Informatika",
    fakultas: "teknik",
    angkatan: 2015,
    tahunLulus: 2019,
    pekerjaan: "Software Engineer",
    perusahaan: "Google",
    testimoni: "Kurikulum berbasis proyek di iSTTS mempersiapkan saya untuk menghadapi tantangan teknis di level global.",
  },
  {
    nrp: "215011602",
    nama: "Lisa Santoso",
    email: "lisa.santoso@gmail.com",
    noHp: "081234567902",
    prodi: "S1 Desain Produk",
    fakultas: "desain",
    angkatan: 2016,
    tahunLulus: 2020,
    pekerjaan: "Product Designer",
    perusahaan: "Traveloka",
    testimoni: "iSTTS mengajarkan saya berpikir seperti desainer sekaligus engineer — kombinasi yang sangat berharga.",
  },
];

async function seedMahasiswaAlumni() {
  for (const m of dummyMahasiswa) {
    const exists = await Mahasiswa.findOne({ nrp: m.nrp });
    if (!exists) {
      await Mahasiswa.create(m);
      console.log(`[Seeder] Mahasiswa ${m.nama} (${m.nrp}) ditambahkan`);
    } else {
      console.log(`[Seeder] Mahasiswa ${m.nrp} sudah ada, dilewati`);
    }
  }

  for (const a of dummyAlumni) {
    const exists = await Alumni.findOne({ nrp: a.nrp });
    if (!exists) {
      await Alumni.create(a);
      console.log(`[Seeder] Alumni ${a.nama} (${a.nrp}) ditambahkan`);
    } else {
      console.log(`[Seeder] Alumni ${a.nrp} sudah ada, dilewati`);
    }
  }
}

async function run() {
  await connectDB();
  await seedMahasiswaAlumni();
  await mongoose.disconnect();
  console.log("[Seeder] Selesai.");
  process.exit(0);
}

run().catch((err) => {
  console.error("[Seeder] Gagal:", err);
  process.exit(1);
});
