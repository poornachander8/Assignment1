/**
 * OTP Service — mock implementation.
 * In production: replace sendOtp body with MSG91 or Twilio Verify API call.
 *
 * MSG91 example:
 *   POST https://api.msg91.com/api/v5/otp
 *   Headers: { authkey: process.env.MSG91_AUTH_KEY }
 *   Body: { template_id, mobile: `91${mobile}`, otp }
 */
const sendOtp = async (mobile, otp) => {
  // MOCK: log to server console only — never return in API response
  console.log(`[OTP] Mobile: ${mobile} → OTP: ${otp}`);
  return true;
};

module.exports = { sendOtp };
