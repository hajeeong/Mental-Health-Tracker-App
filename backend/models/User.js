const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'guardian'],
    required: true
  },
  guardianEmail: {
    type: String,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);