import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads", "ijazah");

// Pastikan folder upload ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format nama file: <timestamp>-<nama_asli_disanitasi>
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    cb(null, `${Date.now()}-${sanitized}`);
  },
});

const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function fileFilter(req, file, cb) {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error("Format file ijazah harus PDF, JPG, atau PNG");
    err.statusCode = 400;
    cb(err);
  }
}

export const uploadIjazah = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // maksimal 5MB
  },
}).single("fileIjazah"); // nama field di form-data harus "fileIjazah"
