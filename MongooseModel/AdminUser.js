// Model Admin User
// untuk simpan listing akun Admin
// { userName, passwordHash }

const mongoose = require('mongoose');
const adminUserSchema = new mongoose.Schema({
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "super-admin"],
      required:true,
      trim: true,
      lowercase: true
    }
});
module.exports = mongoose.model('AdminUser', adminUserSchema);