// Middleware untuk menangkap route yang tidak ditemukan (404)
export function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
  });
}

// Middleware penangkap error global (taruh paling akhir, setelah semua route)
export function errorHandler(err, req, res, next) {
  console.error("[ERROR]", err);

  // Error duplikat unique field dari MongoDB (misal email/NRP sudah ada)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({
      success: false,
      message: `Data dengan ${field} tersebut sudah terdaftar`,
    });
  }

  // Error validasi Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Error format ObjectId tidak valid
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: `ID tidak valid: ${err.value}` });
  }

  // Error dari multer (upload file)
  if (err.name === "MulterError") {
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
}
