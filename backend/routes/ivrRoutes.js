const express = require('express');
const { handleIncoming } = require('../services/ivrService');

const router = express.Router();

/**
 * POST /api/ivr/incoming-call
 *
 * Production (Exotel): receives { CallFrom, SpeechResult }
 * Development/Testing:  receives { mobile, message }
 */
router.post('/incoming-call', async (req, res, next) => {
  try {
    // Normalize field names from Exotel or dev format
    const mobile = (req.body.CallFrom || req.body.mobile || '').replace(/^\+91/, '').replace(/^0/, '');
    const transcript = req.body.SpeechResult || req.body.message || '';

    const result = await handleIncoming(mobile, transcript);

    // Exotel/Twilio expect an XML or JSON response to end the call
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
