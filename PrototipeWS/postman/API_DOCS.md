# Dokumentasi API — iSTTS Backend (D3SI26 ProyekFPW)

Base URL (lokal): `http://localhost:5000/api`

Semua response berbentuk JSON dengan format dasar:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "..." }
```

File koleksi Postman tersedia di `postman/iSTTS-API.postman_collection.json` — import langsung ke Postman untuk mencoba semua endpoint tanpa perlu mengetik ulang.

---

## 1. Autentikasi Admin (`/api/auth`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/auth/login` | Publik | Login admin, mengembalikan JWT token |
| POST | `/auth/register` | Superadmin | Membuat akun admin baru |
| GET | `/auth/me` | Admin (login) | Data admin yang sedang login |

### POST /auth/login
```json
// Request
{ "email": "admin@istts.ac.id", "password": "admin12345" }

// Response 200
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": { "id": "...", "nama": "Super Admin", "email": "admin@istts.ac.id", "role": "superadmin" }
  }
}
```
Token ini dipakai di semua endpoint yang butuh login, lewat header:
```
Authorization: Bearer <token>
```
Token berlaku selama `JWT_EXPIRES_IN` (default 1 hari, diatur di `.env`).

---

## 2. Mahasiswa (`/api/mahasiswa`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/mahasiswa` | Publik | List mahasiswa (paginasi, filter, search) |
| GET | `/mahasiswa/:id` | Publik | Detail 1 mahasiswa |
| POST | `/mahasiswa` | Admin | Tambah mahasiswa baru |
| PUT | `/mahasiswa/:id` | Admin | Update data mahasiswa |
| DELETE | `/mahasiswa/:id` | Admin | Hapus data mahasiswa |

### Query params GET /mahasiswa
`page`, `limit`, `search` (cari di nama/nrp/email), `fakultas` (`teknik`/`desain`), `prodi`, `status` (`aktif`/`cuti`/`non-aktif`/`lulus`/`do`), `angkatan`

### Body POST/PUT /mahasiswa
```json
{
  "nrp": "225011701",
  "nama": "Budi Santoso",
  "email": "budi@student.istts.ac.id",
  "noHp": "081234567890",
  "prodi": "S1 Teknik Informatika",
  "fakultas": "teknik",
  "angkatan": 2023,
  "semester": 3,
  "status": "aktif",
  "alamat": "Jl. Contoh No. 1, Surabaya"
}
```
*PUT mendukung partial update — kirim hanya field yang ingin diubah.*

---

## 3. Alumni (`/api/alumni`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| GET | `/alumni` | Publik | List alumni (paginasi, filter, search) |
| GET | `/alumni/:id` | Publik | Detail 1 alumni |
| POST | `/alumni` | Admin | Tambah alumni baru |
| PUT | `/alumni/:id` | Admin | Update data alumni |
| DELETE | `/alumni/:id` | Admin | Hapus data alumni |

### Query params GET /alumni
`page`, `limit`, `search` (cari di nama/nrp/perusahaan), `fakultas`, `prodi`, `angkatan`, `tahunLulus`

### Body POST/PUT /alumni
```json
{
  "nrp": "215011601",
  "nama": "Rizky Hermawan",
  "email": "rizky@gmail.com",
  "noHp": "081234567901",
  "prodi": "S1 Teknik Informatika",
  "fakultas": "teknik",
  "angkatan": 2015,
  "tahunLulus": 2019,
  "pekerjaan": "Software Engineer",
  "perusahaan": "Google",
  "testimoni": "...",
  "linkedin": "https://linkedin.com/in/..."
}
```

---

## 4. Pendaftaran (`/api/pendaftaran`)

| Method | Endpoint | Akses | Deskripsi |
|---|---|---|---|
| POST | `/pendaftaran` | Publik | Submit form pendaftaran + upload ijazah |
| GET | `/pendaftaran` | Admin | List semua pendaftaran masuk |
| GET | `/pendaftaran/:id` | Admin | Detail 1 pendaftaran |
| PUT | `/pendaftaran/:id/status` | Admin | Verifikasi / tolak pendaftaran |
| DELETE | `/pendaftaran/:id` | Admin | Hapus data pendaftaran |

### POST /pendaftaran
**Content-Type: `multipart/form-data`** (bukan JSON, karena ada file)

| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `namaLengkap` | text | ✅ | min 3 karakter |
| `email` | text | ✅ | format email valid |
| `noHp` | text | ✅ | format `08xxxxxxxxxx` |
| `prodiPilihan` | text | ✅ | nama program studi |
| `pesan` | text | – | opsional, maks 1000 karakter |
| `fileIjazah` | file | ✅ | PDF/JPG/PNG, maks 5MB |

Contoh `fetch` dari frontend React:
```js
const formData = new FormData();
formData.append("namaLengkap", namaLengkap);
formData.append("email", email);
formData.append("noHp", noHp);
formData.append("prodiPilihan", prodiPilihan);
formData.append("pesan", pesan);
formData.append("fileIjazah", fileInput.files[0]);

const res = await fetch("http://localhost:5000/api/pendaftaran", {
  method: "POST",
  body: formData, // JANGAN set Content-Type manual, browser akan set boundary otomatis
});
```

File yang sudah diupload bisa diakses lewat:
```
http://localhost:5000/uploads/ijazah/<nama_file>
```

### PUT /pendaftaran/:id/status
```json
{ "status": "diverifikasi" }
```
Nilai valid: `menunggu` | `diverifikasi` | `ditolak`

---

## 5. Kode Status & Error

| Status | Arti |
|---|---|
| 200 | OK |
| 201 | Data berhasil dibuat |
| 400 | Input tidak valid (gagal validasi Joi / Mongoose / file salah format) |
| 401 | Belum login / token tidak valid / token expired |
| 403 | Login tapi tidak punya izin (role tidak sesuai) |
| 404 | Data atau endpoint tidak ditemukan |
| 409 | Data duplikat (NRP/email sudah terdaftar) |
| 500 | Error tak terduga di server |

Contoh error validasi (400):
```json
{
  "success": false,
  "message": "Input tidak valid",
  "errors": [
    "NRP harus terdiri dari 9 digit angka",
    "Format nomor HP tidak valid"
  ]
}
```

---

## 6. 3rd Party API (Postman) — Web Service & Cloud Computing

Sesuai kurikulum mata kuliah **MI442 Web Service** dan **MI341 Cloud Computing**, bagian ini didokumentasikan terpisah karena akan memanggil API pihak ketiga (bukan API milik backend iSTTS sendiri). Contoh kebutuhan yang relevan dengan proyek ini:

- **Payment Gateway** (Midtrans/Xendit sandbox) — untuk model pembayaran pendaftaran yang masih belum dikerjakan
- **Email service** (contoh: Resend/Mailtrap) — notifikasi otomatis saat status pendaftaran berubah
- **Maps/Geocoding API** — opsional, untuk validasi alamat mahasiswa

Endpoint pihak ketiga ini sebaiknya dipanggil dari **backend** (bukan langsung dari frontend) agar API key tidak terekspos ke browser. Tempatkan kredensial di `.env` backend, lalu buat endpoint baru di backend yang men-forward request ke 3rd party API tersebut.

> Status: belum diimplementasikan — placeholder ini disiapkan supaya tim bisa langsung lanjut begitu provider (payment/email) sudah ditentukan.
