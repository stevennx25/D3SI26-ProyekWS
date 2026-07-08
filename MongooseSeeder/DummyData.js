// Generasi data pakai Faker JS
const { faker } = require('@faker-js/faker'); // Cukup import faker saja

function generateData(banyakData) {
    const DummyDosen = [];
    const DummyAlumni = [];

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

    return { DummyAlumni, DummyDosen }
}


module.exports = {
    generateData
};