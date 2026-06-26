# iSTTS Backend API

Backend untuk proyek D3SI26-ProyekFPW. Menyediakan REST API untuk data mahasiswa, alumni, autentikasi admin, dan form pendaftaran dengan upload ijazah.

## Stack
- **Node.js + Express** — REST API
- **MongoDB + Mongoose** — database
- **JWT (jsonwebtoken)** — autentikasi & otorisasi admin
- **Joi** — validasi input
- **Multer** — upload file ijazah
- **bcryptjs** — hashing password admin

## Struktur Folder
```
backend/
├── src/
│   ├── config/         # koneksi MongoDB
│   ├── models/         # schema Mongoose (Admin, Mahasiswa, Alumni, Pendaftaran)
│   ├── controllers/    # logic tiap endpoint
│   ├── routes/         # definisi route + middleware per route
│   ├── middlewares/    # auth (JWT), validasi Joi, upload (multer), error handler
│   ├── validations/    # schema Joi
│   ├── seeders/        # script isi data awal (admin default + sample data)
│   ├── app.js           # konfigurasi Express (cors, json parser, static files, routes)
│   └── server.js        # entry point, connect DB lalu listen
├── uploads/ijazah/      # file ijazah yang diupload (jangan di-commit isinya, lihat .gitignore)
├── postman/             # koleksi Postman + dokumentasi API
├── .env.example         # contoh environment variable
└── package.json
```

## Cara Menjalankan (Lokal)

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Siapkan MongoDB**
   - Lokal: install MongoDB Community Server, jalankan `mongod`
   - Atau pakai MongoDB Atlas (gratis tier) — ambil connection string dari sana

3. **Buat file `.env`**
   ```bash
   cp .env.example .env
   ```
   Lalu isi `MONGO_URI`, `JWT_SECRET` (string acak panjang), dan lainnya sesuai kebutuhan.

4. **Jalankan seeder** (membuat akun admin default + contoh data)
   ```bash
   npm run seed         # bikin akun admin default
   npm run seed:sample  # bikin contoh data mahasiswa & alumni (opsional)
   ```
   Login admin default ada di `.env` (`ADMIN_DEFAULT_EMAIL` / `ADMIN_DEFAULT_PASSWORD`).
   **Ganti password ini setelah login pertama**, terutama nanti saat sudah di-hosting.

5. **Jalankan server**
   ```bash
   npm run dev   # auto-restart saat ada perubahan file (pakai node --watch)
   # atau
   npm start     # tanpa auto-restart, untuk production
   ```
   Server berjalan di `http://localhost:5000` (atau sesuai `PORT` di `.env`).

6. **Tes API**
   - Buka `http://localhost:5000/api` di browser → harus muncul JSON status aktif
   - Import `postman/iSTTS-API.postman_collection.json` ke Postman untuk tes semua endpoint
   - Baca `postman/API_DOCS.md` untuk detail tiap endpoint

## Menghubungkan ke Frontend (React/Vite)

Di file `.env` frontend (folder root project, bukan `/backend`), tambahkan:
```
VITE_API_URL=http://localhost:5000/api
```
Lalu di kode React, fetch API pakai `import.meta.env.VITE_API_URL`.

Pastikan juga `CLIENT_ORIGIN` di `.env` backend cocok dengan URL dev server Vite (default `http://localhost:5173`), supaya tidak kena blokir CORS.

## Catatan Keamanan
- **Jangan pernah commit file `.env`** ke git — sudah masuk `.gitignore`
- Ganti `JWT_SECRET` dan password admin default sebelum deploy ke hosting
- Endpoint create/update/delete untuk mahasiswa, alumni, dan pendaftaran **wajib token admin** (lihat header `Authorization: Bearer <token>`)
- Endpoint `register` admin baru hanya bisa dipanggil oleh role `superadmin`

## Yang Masih Perlu Dikerjakan
- [ ] Hosting (gratis) — kandidat: Render, Railway, atau Fly.io untuk backend; MongoDB Atlas untuk database
- [ ] Payment model — integrasi payment gateway (lihat `postman/API_DOCS.md` bagian 3rd Party API)
- [ ] 3rd party API endpoint lain (email notifikasi, dsb)

## Lisensi Internal
Proyek tugas kelompok mata kuliah Framework Pemrograman Web — D3 Sistem Informasi, iSTTS.
