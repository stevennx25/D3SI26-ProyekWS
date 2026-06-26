import express from "express";
import {
  getAllAlumni,
  getAlumniById,
  createAlumni,
  updateAlumni,
  deleteAlumni,
} from "../controllers/alumni.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createAlumniSchema, updateAlumniSchema } from "../validations/alumni.validation.js";

const router = express.Router();

// GET boleh diakses publik (misal untuk ditampilkan di halaman web - section Alumni),
// tapi create/update/delete WAJIB login sebagai admin.
router.get("/", getAllAlumni);
router.get("/:id", getAlumniById);

router.post("/", authenticate, validate(createAlumniSchema), createAlumni);
router.put("/:id", authenticate, validate(updateAlumniSchema), updateAlumni);
router.delete("/:id", authenticate, deleteAlumni);

export default router;
