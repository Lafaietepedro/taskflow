/* eslint-env node */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  fullName: { type: String, trim: true, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);
