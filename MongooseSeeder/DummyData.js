// Generasi data pakai Faker JS
const { faker } = require('@faker-js/faker');
const mongoose = require("mongoose");

const SampleAdmin = [
    {
        userName: "bu mawar",
        passwordHash: "mawarpmb",
        role: "pmb"
    }, {
        userName: "bu melati",
        passwordHash: "melatipmb",
        role: "pmb"
    }, {
        userName: "rektor",
        passwordHash: "rektor",
        role: "rektorat"
    }, {
        userName: "IT",
        passwordHash: "IT",
        role: "super-admin"
    }, {
        userName: "bak",
        passwordHash: "bakadmin",
        role: "kemahasiswaan"
    }
]

function generateData(banyakData) {
    const DummyDosen = [];
    const DummyAlumni = [];
    const DummyProjectMahasiswa = [];

    for (let i = 0; i < banyakData; i++) {
        DummyProjectMahasiswa.push({
            judulProject: faker.book.title(),
            deskripsiSingkatProject: faker.lorem.sentences(3),
            tagProject: faker.helpers.arrayElements([faker.book.genre(), faker.book.genre(), faker.book.genre()]),
            prodi: faker.helpers.arrayElement(["S1 - Informatika", "D3 - Sistem Informasi", "S1 - Desain Komunikasi Visual", "S1 - Sistem Informasi Bisnis", "S1 - Desain Produk", "S1 - Manajemen Bisnis Digital", null]),
            pathFotoSampul: faker.image.url({width: 600, height: 300}) 
        })
    }

    for (let i = 0; i < banyakData; i++) {
        DummyDosen.push({
            nid: faker.string.uuid(),
            nama: faker.person.fullName(),
            jabatan: faker.person.jobType(), 
            // Menggunakan arrayElement (tanpa s) agar hasilnya berupa string tunggal, bukan array
            prodi: faker.helpers.arrayElement(["S1 - Informatika", "D3 - Sistem Informasi", "S1 - Desain Komunikasi Visual", "S1 - Sistem Informasi Bisnis", "S1 - Desain Produk", "S1 - Manajemen Bisnis Digital", null]),
            fotoProfil: faker.image.avatarGitHub()
        });
    }
    
    for (let i = 0; i < banyakData; i++) {
        // 1. Memastikan NRP unik dengan menggunakan indeks perulangan 'i' sebagai jaminan nomor urut
        const nomorUrut = (i + 1).toString().padStart(3, '0'); 
        const kodeProdi = faker.helpers.arrayElement(["017", "117", "011"]);
        const tahunAngkatan = faker.number.int({ min: 200, max: 222 }).toString();
        const nrpUnik = tahunAngkatan + kodeProdi + nomorUrut;
    
        // 2. Membuat nama full untuk base email & nama document
        const namaLengkap = faker.person.fullName();
        
        // 3. Memperkecil peluang email duplikat dengan menyelipkan nrpUnik ke dalam email
        const emailUnik = `${faker.person.firstName().toLowerCase()}.${nrpUnik}@example.mail.dev`;
    
        DummyAlumni.push({
            nrp: nrpUnik,
            nama: namaLengkap,
            email: emailUnik, // Dijamin unik karena mengandung NRP
            noHp: faker.phone.number({ style: "mobile" }).toString(),
            prodi: faker.helpers.arrayElement(["S1 - Informatika", "D3 - Sistem Informasi", "S1 - Desain Komunikasi Visual", "S1 - Sistem Informasi Bisnis", "S1 - Desain Produk", "S1 - Manajemen Bisnis Digital"]),
            fakultas: faker.helpers.arrayElement(["teknik", "desain"]),
            angkatan: faker.number.int({ min: 2000, max: 2022 }), // Biarkan berwujud Number sesuai Schema
            tahunLulus: faker.number.int({ min: 2003, max: 2027 }), // Biarkan berwujud Number sesuai Schema
            pekerjaan: faker.person.jobTitle(),
            perusahaan: faker.company.name(),
            testimoni: faker.lorem.sentence(20),
            linkedin: "linkedin.com/in/" + faker.person.firstName().toLowerCase() + nrpUnik,
            fotoProfil: faker.image.url(),
        });
    }

    const DummyMahasiswa = []
    const DummyWalletMahasiswa = []

    // generator mahasiswa beserta wallet nya di bawah ini, menggunakan faker
    // Generator mahasiswa beserta wallet nya
    for (let i = 0; i < banyakData; i++) {
        // 1. Generate ObjectId manual agar bisa langsung di-link ke Wallet
        const mahasiswaId = new mongoose.Types.ObjectId();

        // 2. Logika Pembuatan NRP Unik (Mengikuti aturan alumni Anda)
        const nomorUrut = (i + 1).toString().padStart(3, '0');
        const kodeProdi = faker.helpers.arrayElement(["017", "117", "011"]);
        const tahunAngkatan = faker.number.int({ min: 200, max: 222 }).toString();
        const nrpUnik = tahunAngkatan + kodeProdi + nomorUrut;

        // 3. Push data ke DummyMahasiswa
        DummyMahasiswa.push({
            _id: mahasiswaId, // Kunci utama: pasang ID bikinan kita sendiri
            namaMahasiswa: faker.person.fullName(),
            nrpMahasiswa: nrpUnik
        });

        // 4. Push data ke DummyWalletMahasiswa
        DummyWalletMahasiswa.push({
            idMahasiswa: mahasiswaId,
            saldo: faker.number.int({ min: 10000, max: 500000 }) // Mengisi saldo acak antara 10rb - 500rb
        });
    }


    return { DummyAlumni, DummyDosen, DummyProjectMahasiswa, DummyMahasiswa, DummyWalletMahasiswa }
}


module.exports = {
    generateData,
    SampleAdmin
};