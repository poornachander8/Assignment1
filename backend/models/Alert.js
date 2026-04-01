const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    produce: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notifyBySms: {
      type: Boolean,
      default: true,
    },
    notifyByCall: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for fast alert matching queries
alertSchema.index({ produce: 1, isActive: 1, user: 1 });

module.exports = mongoose.model('Alert', alertSchema);
