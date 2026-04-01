const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    village: {
      type: String,
      trim: true,
      default: '',
    },
    otp: {
      type: String, // bcrypt hashed
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    lastOtpSentAt: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
