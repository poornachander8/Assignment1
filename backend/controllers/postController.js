const { validationResult } = require('express-validator');
const Post = require('../models/Post');
const { extractProduce } = require('../utils/produceList');
const alertMatchingService = require('../services/alertMatchingService');

// GET /api/posts
const getPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name village mobile');

    const total = await Post.countDocuments();

    res.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { rawMessage, voiceTranscript, isVoicePost } = req.body;

    // Extract produce from both message and transcript (deduplicated)
    const combined = `${rawMessage} ${voiceTranscript || ''}`;
    const produceTags = extractProduce(combined);

    const post = await Post.create({
      author: req.user._id,
      rawMessage,
      voiceTranscript: voiceTranscript || '',
      produceTags,
      isVoicePost: Boolean(isVoicePost),
      source: 'app',
    });

    // Populate author for alert matching (needs name/village for message)
    await post.populate('author', 'name village mobile');

    // Run alert matching asynchronously — don't block the response
    alertMatchingService.match(post).catch((err) =>
      console.error('[AlertMatch Error]', err.message)
    );

    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post nahi mili' });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Yeh aapki post nahi hai' });
    }
    await post.deleteOne();
    res.json({ message: 'Post delete ho gayi' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPosts, createPost, deletePost };
