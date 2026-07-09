// Model Admin User
// untuk simpan listing akun Admin
// { userName, passwordHash, role }

const { ACL } = require("../Authorization/ACL")
const role = []
ACL.forEach(entry => {
  role.push(entry.role)
});
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
      enum: role,
      required:true,
      trim: true,
    }
});
module.exports = mongoose.model('AdminUser', adminUserSchema);