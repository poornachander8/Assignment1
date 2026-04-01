/**
 * Outbound Call Notification Service — mock implementation.
 * Calls the user and speaks the alert message in Hindi (Text-to-Speech).
 *
 * In production with Exotel:
 *   POST https://api.exotel.com/v1/Accounts/{SID}/Calls/connect
 *   Auth: Basic (SID:TOKEN)
 *   Body (form): {
 *     From: process.env.EXOTEL_VIRTUAL_NUMBER,
 *     To: `0${mobile}`,
 *     Url: `http://my-server.com/api/ivr/tts-xml?message=${encodeURIComponent(message)}`,
 *     CallType: 'trans'
 *   }
 *
 * In production with Twilio:
 *   client.calls.create({
 *     twiml: `<Response><Say language="hi-IN">${message}</Say></Response>`,
 *     to: `+91${mobile}`,
 *     from: process.env.TWILIO_PHONE_NUMBER
 *   })
 */
const call = async (mobile, message) => {
  console.log(`[CALL] Calling: ${mobile} | Message: "${message}"`);
  return true;
};

module.exports = { call };
