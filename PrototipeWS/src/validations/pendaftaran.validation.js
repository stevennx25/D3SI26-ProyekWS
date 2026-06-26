import Joi from "joi";

export const pendaftaranSchema = Joi.object({
  namaLengkap: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Nama lengkap wajib diisi",
    "string.min": "Nama lengkap minimal 3 karakter",
    "any.required": "Nama lengkap wajib diisi",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid",
    "string.empty": "Email wajib diisi",
    "any.required": "Email wajib diisi",
  }),

  noHp: Joi.string()
    .pattern(/^(\+62|62|0)8[0-9]{8,12}$/)
    .required()
    .messages({
      "string.pattern.base": "Format nomor HP tidak valid (contoh: 08123456789)",
      "string.empty": "Nomor HP wajib diisi",
      "any.required": "Nomor HP wajib diisi",
    }),

  prodiPilihan: Joi.string().required().messages({
    "string.empty": "Program studi wajib dipilih",
    "any.required": "Program studi wajib dipilih",
  }),

  pesan: Joi.string().allow("").max(1000).messages({
    "string.max": "Pesan maksimal 1000 karakter",
  }),
});
