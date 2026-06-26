import { verifyToken } from "../utils/jwt.js";
import Admin from "../models/Admin.js";

/**
 * Middleware AUTHENTICATION
 * Memastikan request membawa token JWT yang valid di header:
 * Authorization: Bearer <token>
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token tidak ditemukan. Sertakan header Authorization: Bearer <token>",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Pastikan admin masih ada di database (tidak dihapus setelah token terbit)
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin terkait token ini tidak ditemukan",
      });
    }

    req.admin = {
      id: admin._id,
      nama: admin.nama,
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token sudah expired, silakan login kembali" });
    }
    return res.status(401).json({ success: false, message: "Token tidak valid" });
  }
}

/**
 * Middleware AUTHORIZATION
 * Membatasi akses endpoint hanya untuk role tertentu.
 * Contoh: authorize("superadmin")
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: "Belum terautentikasi" });
    }
    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak memiliki izin untuk mengakses resource ini",
      });
    }
    next();
  };
}
