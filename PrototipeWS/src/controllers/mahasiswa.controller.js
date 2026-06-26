import Mahasiswa from "../models/Mahasiswa.js";

/**
 * GET /api/mahasiswa
 * Mendukung query params:
 *  - page, limit (paginasi)
 *  - search (cari di nama/nrp)
 *  - fakultas, prodi, status, angkatan (filter)
 */
export async function getAllMahasiswa(req, res, next) {
  try {
    const { page = 1, limit = 10, search, fakultas, prodi, status, angkatan } = req.query;

    const filter = {};
    if (fakultas) filter.fakultas = fakultas;
    if (prodi) filter.prodi = prodi;
    if (status) filter.status = status;
    if (angkatan) filter.angkatan = Number(angkatan);
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: "i" } },
        { nrp: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Mahasiswa.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Mahasiswa.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/mahasiswa/:id
 */
export async function getMahasiswaById(req, res, next) {
  try {
    const mahasiswa = await Mahasiswa.findById(req.params.id);
    if (!mahasiswa) {
      return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: mahasiswa });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/mahasiswa
 * Khusus admin (dilindungi authenticate di routes)
 */
export async function createMahasiswa(req, res, next) {
  try {
    const mahasiswa = await Mahasiswa.create(req.body);
    res.status(201).json({
      success: true,
      message: "Data mahasiswa berhasil ditambahkan",
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/mahasiswa/:id
 * Khusus admin (dilindungi authenticate di routes)
 */
export async function updateMahasiswa(req, res, next) {
  try {
    const mahasiswa = await Mahasiswa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!mahasiswa) {
      return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
    }
    res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil diperbarui",
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/mahasiswa/:id
 * Khusus admin (dilindungi authenticate di routes)
 */
export async function deleteMahasiswa(req, res, next) {
  try {
    const mahasiswa = await Mahasiswa.findByIdAndDelete(req.params.id);
    if (!mahasiswa) {
      return res.status(404).json({ success: false, message: "Mahasiswa tidak ditemukan" });
    }
    res.status(200).json({
      success: true,
      message: "Data mahasiswa berhasil dihapus",
      data: mahasiswa,
    });
  } catch (err) {
    next(err);
  }
}
