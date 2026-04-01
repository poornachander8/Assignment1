const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendOtp } = require('../services/otpService');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) =>
  jwt.sign({ id: user._id, mobile: user.mobile }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

// POST /api/auth/send-otp
const sendOtpHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { mobile } = req.body;

    // Rate limit: 1 OTP per 2 minutes
    const user = await User.findOne({ mobile });
    if (user && user.lastOtpSentAt) {
      const diff = Date.now() - user.lastOtpSentAt.getTime();
      if (diff < 2 * 60 * 1000) {
        return res.status(429).json({ message: '2 minute baad phir try karein' });
      }
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiry = new Date(Date.now() + (process.env.OTP_EXPIRY_MINUTES || 15) * 60 * 1000);

    await User.findOneAndUpdate(
      { mobile },
      { otp: hashedOtp, otpExpiry: expiry, lastOtpSentAt: new Date() },
      { upsert: true, new: true }
    );

    await sendOtp(mobile, otp);

    res.json({ message: 'OTP bhej diya gaya hai' });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
const verifyOtpHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { mobile, otp } = req.body;
    const user = await User.findOne({ mobile });

    if (!user || !user.otp) {
      return res.status(400).json({ message: 'Pehle OTP mangaiye' });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expire ho gaya, dobara mangaiye' });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      return res.status(400).json({ message: 'Galat OTP hai' });
    }

    // Clear OTP after successful verification
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = generateToken(user);
    res.json({
      token,
      user: { _id: user._id, mobile: user.mobile, name: user.name, village: user.village },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, village } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, village },
      { new: true, select: '-otp -otpExpiry' }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-otp -otpExpiry');
    if (!user) return res.status(404).json({ message: 'User nahi mila' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendOtpHandler, verifyOtpHandler, updateProfile, getMe };
