import Alumni from "../models/Alumni.js";

/**
 * GET /api/alumni
 * Mendukung query params:
 *  - page, limit (paginasi)
 *  - search (cari di nama/nrp/perusahaan)
 *  - fakultas, prodi, angkatan, tahunLulus (filter)
 */
export async function getAllAlumni(req, res, next) {
  try {
    const { page = 1, limit = 10, search, fakultas, prodi, angkatan, tahunLulus } = req.query;

    const filter = {};
    if (fakultas) filter.fakultas = fakultas;
    if (prodi) filter.prodi = prodi;
    if (angkatan) filter.angkatan = Number(angkatan);
    if (tahunLulus) filter.tahunLulus = Number(tahunLulus);
    if (search) {
      filter.$or = [
        { nama: { $regex: search, $options: "i" } },
        { nrp: { $regex: search, $options: "i" } },
        { perusahaan: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Alumni.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Alumni.countDocuments(filter),
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
 * GET /api/alumni/:id
 */
export async function getAlumniById(req, res, next) {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: alumni });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/alumni
 * Khusus admin (dilindungi authenticate di routes)
 */
export async function createAlumni(req, res, next) {
  try {
    const alumni = await Alumni.create(req.body);
    res.status(201).json({
      success: true,
      message: "Data alumni berhasil ditambahkan",
      data: alumni,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/alumni/:id
 * Khusus admin (dilindungi authenticate di routes)
 */
export async function updateAlumni(req, res, next) {
  try {
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni tidak ditemukan" });
    }
    res.status(200).json({
      success: true,
      message: "Data alumni berhasil diperbarui",
      data: alumni,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/alumni/:id
 * Khusus admin (dilindungi authenticate di routes)
 */
export async function deleteAlumni(req, res, next) {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni tidak ditemukan" });
    }
    res.status(200).json({
      success: true,
      message: "Data alumni berhasil dihapus",
      data: alumni,
    });
  } catch (err) {
    next(err);
  }
}
