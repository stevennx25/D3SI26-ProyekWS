import Joi from "joi";

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email wajib diisi",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password wajib diisi",
    "any.required": "Password wajib diisi",
  }),
});

export const registerAdminSchema = Joi.object({
  nama: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter",
  }),
  role: Joi.string().valid("admin", "superadmin").default("admin"),
});
