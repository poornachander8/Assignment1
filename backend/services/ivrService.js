const User = require('../models/User');
const Post = require('../models/Post');
const { extractProduce } = require('../utils/produceList');
const alertMatchingService = require('./alertMatchingService');

/**
 * Handle an inbound IVR call / test webhook.
 * In production, Exotel/Twilio sends: CallFrom, SpeechResult (or RecordingUrl).
 * For development/testing: POST { mobile, message } directly.
 *
 * @param {string} mobile - Caller's 10-digit mobile number
 * @param {string} transcript - Spoken message transcribed by IVR provider
 * @returns {{ success: boolean, post?: object, message: string }}
 */
const handleIncoming = async (mobile, transcript) => {
  if (!mobile || !transcript) {
    return { success: false, message: 'mobile aur message dono zaroori hai' };
  }

  // Look up the registered user by mobile number
  const user = await User.findOne({ mobile: mobile.trim(), isVerified: true });
  if (!user) {
    return {
      success: false,
      message: 'Aap registered nahi hain. Pehle app mein register karein.',
    };
  }

  // Extract produce tags from transcript
  const produceTags = extractProduce(transcript);

  // Create the post
  const post = await Post.create({
    author: user._id,
    rawMessage: transcript,
    voiceTranscript: transcript,
    produceTags,
    isVoicePost: true,
    source: 'ivr',
  });

  // Run alert matching (notify other users)
  await alertMatchingService.match(post);

  console.log(`[IVR] Post created by ${mobile}: "${transcript}" | Tags: ${produceTags.join(', ')}`);

  return {
    success: true,
    post,
    message: 'Aapki post ho gayi! Dhanyawaad.',
  };
};

module.exports = { handleIncoming };
