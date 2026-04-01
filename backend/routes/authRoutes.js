const express = require('express');
const { body } = require('express-validator');
const { sendOtpHandler, verifyOtpHandler, updateProfile, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/send-otp',
  [body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid 10-digit mobile number daale')],
  sendOtpHandler
);

router.post(
  '/verify-otp',
  [
    body('mobile').matches(/^[6-9]\d{9}$/).withMessage('Valid mobile number daale'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('6-digit OTP daale'),
  ],
  verifyOtpHandler
);

router.put(
  '/profile',
  protect,
  [
    body('name').notEmpty().trim().withMessage('Naam zaroori hai'),
    body('village').optional().trim(),
  ],
  updateProfile
);

router.get('/me', protect, getMe);

module.exports = router;
