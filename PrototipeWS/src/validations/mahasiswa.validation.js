import Joi from "joi";

export const createMahasiswaSchema = Joi.object({
  nrp: Joi.string().pattern(/^[0-9]{9}$/).required().messages({
    "string.pattern.base": "NRP harus terdiri dari 9 digit angka",
    "any.required": "NRP wajib diisi",
  }),
  nama: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  noHp: Joi.string()
    .pattern(/^(\+62|62|0)8[0-9]{8,12}$/)
    .required()
    .messages({ "string.pattern.base": "Format nomor HP tidak valid" }),
  prodi: Joi.string().required(),
  fakultas: Joi.string().valid("teknik", "desain").required(),
  angkatan: Joi.number().integer().min(2000).max(2100).required(),
  semester: Joi.number().integer().min(1).max(14).default(1),
  status: Joi.string().valid("aktif", "cuti", "non-aktif", "lulus", "do").default("aktif"),
  alamat: Joi.string().allow("").max(255),
});

// Saat update, semua field opsional (partial update)
export const updateMahasiswaSchema = Joi.object({
  nrp: Joi.string().pattern(/^[0-9]{9}$/).messages({
    "string.pattern.base": "NRP harus terdiri dari 9 digit angka",
  }),
  nama: Joi.string().min(3).max(100),
  email: Joi.string().email(),
  noHp: Joi.string()
    .pattern(/^(\+62|62|0)8[0-9]{8,12}$/)
    .messages({ "string.pattern.base": "Format nomor HP tidak valid" }),
  prodi: Joi.string(),
  fakultas: Joi.string().valid("teknik", "desain"),
  angkatan: Joi.number().integer().min(2000).max(2100),
  semester: Joi.number().integer().min(1).max(14),
  status: Joi.string().valid("aktif", "cuti", "non-aktif", "lulus", "do"),
  alamat: Joi.string().allow("").max(255),
}).min(1).messages({
  "object.min": "Minimal satu field harus diisi untuk update",
});
