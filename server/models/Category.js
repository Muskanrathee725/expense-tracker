const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String }, // Aapke design ke icons ke liye (e.g., "fastfood", "flight")
  color: { type: String, default: '#000000' } // Cards ka color change karne ke liye
});

module.exports = mongoose.model('Category', categorySchema);