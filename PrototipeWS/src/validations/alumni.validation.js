import Joi from "joi";

export const createAlumniSchema = Joi.object({
  nrp: Joi.string().pattern(/^[0-9]{9}$/).required().messages({
    "string.pattern.base": "NRP harus terdiri dari 9 digit angka",
    "any.required": "NRP wajib diisi",
  }),
  nama: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  noHp: Joi.string()
    .pattern(/^(\+62|62|0)8[0-9]{8,12}$/)
    .messages({ "string.pattern.base": "Format nomor HP tidak valid" }),
  prodi: Joi.string().required(),
  fakultas: Joi.string().valid("teknik", "desain").required(),
  angkatan: Joi.number().integer().min(2000).max(2100).required(),
  tahunLulus: Joi.number().integer().min(2000).max(2100).required(),
  pekerjaan: Joi.string().allow("").max(100),
  perusahaan: Joi.string().allow("").max(100),
  testimoni: Joi.string().allow("").max(500),
  linkedin: Joi.string().uri().allow("").messages({
    "string.uri": "Link LinkedIn harus berupa URL yang valid",
  }),
});

export const updateAlumniSchema = Joi.object({
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
  tahunLulus: Joi.number().integer().min(2000).max(2100),
  pekerjaan: Joi.string().allow("").max(100),
  perusahaan: Joi.string().allow("").max(100),
  testimoni: Joi.string().allow("").max(500),
  linkedin: Joi.string().uri().allow(""),
}).min(1).messages({
  "object.min": "Minimal satu field harus diisi untuk update",
});
