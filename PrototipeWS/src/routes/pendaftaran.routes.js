import express from "express";
import {
  createPendaftaran,
  getAllPendaftaran,
  getPendaftaranById,
  updateStatusPendaftaran,
  deletePendaftaran,
} from "../controllers/pendaftaran.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadIjazah } from "../middlewares/upload.middleware.js";
import { pendaftaranSchema } from "../validations/pendaftaran.validation.js";

const router = express.Router();

/**
 * PUBLIC - form pendaftaran di halaman utama.
 * Urutan middleware penting:
 * 1. uploadIjazah dulu -> multer mem-parsing multipart/form-data jadi req.body & req.file
 * 2. baru validate(pendaftaranSchema) -> Joi mengecek req.body yang sudah terisi
 */
router.post("/", uploadIjazah, validate(pendaftaranSchema), createPendaftaran);

// PROTECTED - khusus admin
router.get("/", authenticate, getAllPendaftaran);
router.get("/:id", authenticate, getPendaftaranById);
router.put("/:id/status", authenticate, updateStatusPendaftaran);
router.delete("/:id", authenticate, deletePendaftaran);

export default router;
