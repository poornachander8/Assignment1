const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    voiceTranscript: {
      type: String,
      trim: true,
      default: '',
    },
    produceTags: {
      type: [String],
      default: [],
      index: true,
    },
    isVoicePost: {
      type: Boolean,
      default: false,
    },
    // Source: 'app' (posted via app) or 'ivr' (posted via phone call)
    source: {
      type: String,
      enum: ['app', 'ivr'],
      default: 'app',
    },
  },
  { timestamps: true }
);

// Index for feed query (newest first)
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
