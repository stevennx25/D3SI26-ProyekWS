const Joi = require('joi');

const registrasiSchema = Joi.object({
  namaLengkap: Joi.string().trim().min(3).required().messages({
    'string.empty': 'Nama lengkap tidak boleh kosong',
    'string.min': 'Nama lengkap minimal 3 karakter',
    'any.required': 'Nama lengkap wajib diisi'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'string.empty': 'Email tidak boleh kosong'
  }),
  noHp: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required().messages({
    'string.pattern.base': 'Nomor HP hanya boleh berisi angka',
    'string.min': 'Nomor HP minimal 10 digit',
    'string.max': 'Nomor HP maksimal 15 digit'
  }),
  prodiPilihan: Joi.string().required().messages({
    'string.empty': 'Program studi harus dipilih'
  }),
  pesan: Joi.string().allow('').optional() // Boleh kosong atau tidak diisi
});

module.exports = {
    registrasiSchema
}