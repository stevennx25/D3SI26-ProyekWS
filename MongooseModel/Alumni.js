const mongoose = require('mongoose');
const alumniSchema = new mongoose.Schema({});
module.exports = mongoose.model('Alumni', alumniSchema);