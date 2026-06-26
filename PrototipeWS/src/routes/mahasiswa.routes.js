import express from "express";
import {
  getAllMahasiswa,
  getMahasiswaById,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "../controllers/mahasiswa.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createMahasiswaSchema,
  updateMahasiswaSchema,
} from "../validations/mahasiswa.validation.js";

const router = express.Router();

// GET boleh diakses publik (misal untuk ditampilkan di halaman web),
// tapi create/update/delete WAJIB login sebagai admin.
router.get("/", getAllMahasiswa);
router.get("/:id", getMahasiswaById);

router.post("/", authenticate, validate(createMahasiswaSchema), createMahasiswa);
router.put("/:id", authenticate, validate(updateMahasiswaSchema), updateMahasiswa);
router.delete("/:id", authenticate, deleteMahasiswa);

export default router;
