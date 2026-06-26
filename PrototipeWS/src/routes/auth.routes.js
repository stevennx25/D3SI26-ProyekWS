import express from "express";
import { login, registerAdmin, getMe } from "../controllers/auth.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerAdminSchema } from "../validations/auth.validation.js";

const router = express.Router();

// PUBLIC
router.post("/login", validate(loginSchema), login);

// PROTECTED - hanya superadmin yang bisa membuat admin baru
router.post(
  "/register",
  authenticate,
  authorize("superadmin"),
  validate(registerAdminSchema),
  registerAdmin
);

// PROTECTED - cek siapa admin yang sedang login
router.get("/me", authenticate, getMe);

export default router;
