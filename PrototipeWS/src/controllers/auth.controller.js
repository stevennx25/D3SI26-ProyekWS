import Admin from "../models/Admin.js";
import { generateToken } from "../utils/jwt.js";

/**
 * POST /api/auth/login
 * Login admin, mengembalikan JWT token
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // select("+password") karena field password di-set select:false di schema
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Email atau password salah" });
    }

    const token = generateToken({ id: admin._id, role: admin.role });

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: {
        token,
        admin: {
          id: admin._id,
          nama: admin.nama,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/register
 * Membuat akun admin baru. Endpoint ini sendiri dilindungi authenticate + authorize("superadmin")
 * di routes, supaya hanya superadmin yang bisa menambah admin baru.
 */
export async function registerAdmin(req, res, next) {
  try {
    const { nama, email, password, role } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email sudah terdaftar sebagai admin" });
    }

    const admin = await Admin.create({ nama, email, password, role });

    res.status(201).json({
      success: true,
      message: "Admin baru berhasil dibuat",
      data: {
        id: admin._id,
        nama: admin.nama,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Mengembalikan data admin yang sedang login (berdasarkan token)
 */
export async function getMe(req, res, next) {
  try {
    res.status(200).json({ success: true, data: req.admin });
  } catch (err) {
    next(err);
  }
}
