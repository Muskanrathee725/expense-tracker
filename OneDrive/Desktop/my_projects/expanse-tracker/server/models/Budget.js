const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

budgetSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
