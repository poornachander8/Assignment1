/**
 * SMS Notification Service — mock implementation.
 * In production: swap body for MSG91 transactional SMS or Twilio SMS.
 *
 * MSG91 example:
 *   POST https://api.msg91.com/api/sendhttp.php
 *   Params: { authkey, mobiles: `91${mobile}`, message, sender: process.env.MSG91_SENDER_ID, route: 4 }
 */
const send = async (mobile, message) => {
  console.log(`[SMS] To: ${mobile} | Message: "${message}"`);
  return true;
};

module.exports = { send };
