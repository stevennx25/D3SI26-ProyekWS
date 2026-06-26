import fs from "fs";
import path from "path";
import Pendaftaran from "../models/Pendaftaran.js";

/**
 * POST /api/pendaftaran
 * PUBLIC endpoint - dipakai oleh form pendaftaran di halaman utama.
 * Menggunakan multipart/form-data karena ada file upload ijazah.
 * Body fields: namaLengkap, email, noHp, prodiPilihan, pesan
 * File field : fileIjazah (PDF/JPG/PNG, maks 5MB)
 */
export async function createPendaftaran(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File ijazah wajib diupload (field: fileIjazah)",
      });
    }

    const pendaftaran = await Pendaftaran.create({
      ...req.body,
      fileIjazah: `/uploads/ijazah/${req.file.filename}`,
      namaFileAsli: req.file.originalname,
    });

    res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil dikirim. Tim kami akan menghubungi Anda.",
      data: pendaftaran,
    });
  } catch (err) {
    // Kalau gagal simpan ke DB, hapus file yang sudah terupload supaya tidak jadi sampah
    if (req.file) {
      const filePath = path.join(process.cwd(), "uploads", "ijazah", req.file.filename);
      fs.unlink(filePath, () => {});
    }
    next(err);
  }
}

/**
 * GET /api/pendaftaran
 * Khusus admin - melihat semua pendaftaran yang masuk
 */
export async function getAllPendaftaran(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Pendaftaran.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Pendaftaran.countDocuments(filter),
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
 * GET /api/pendaftaran/:id
 * Khusus admin
 */
export async function getPendaftaranById(req, res, next) {
  try {
    const pendaftaran = await Pendaftaran.findById(req.params.id);
    if (!pendaftaran) {
      return res.status(404).json({ success: false, message: "Pendaftaran tidak ditemukan" });
    }
    res.status(200).json({ success: true, data: pendaftaran });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/pendaftaran/:id/status
 * Khusus admin - verifikasi/tolak pendaftaran
 */
export async function updateStatusPendaftaran(req, res, next) {
  try {
    const { status } = req.body;
    if (!["menunggu", "diverifikasi", "ditolak"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status tidak valid" });
    }

    const pendaftaran = await Pendaftaran.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!pendaftaran) {
      return res.status(404).json({ success: false, message: "Pendaftaran tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: `Status pendaftaran diubah menjadi "${status}"`,
      data: pendaftaran,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/pendaftaran/:id
 * Khusus admin
 */
export async function deletePendaftaran(req, res, next) {
  try {
    const pendaftaran = await Pendaftaran.findByIdAndDelete(req.params.id);
    if (!pendaftaran) {
      return res.status(404).json({ success: false, message: "Pendaftaran tidak ditemukan" });
    }

    // Hapus juga file ijazah terkait
    if (pendaftaran.fileIjazah) {
      const filePath = path.join(process.cwd(), pendaftaran.fileIjazah);
      fs.unlink(filePath, () => {});
    }

    res.status(200).json({
      success: true,
      message: "Data pendaftaran berhasil dihapus",
      data: pendaftaran,
    });
  } catch (err) {
    next(err);
  }
}
