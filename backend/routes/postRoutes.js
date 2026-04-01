const express = require('express');
const { body } = require('express-validator');
const { getPosts, createPost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getPosts);

router.post(
  '/',
  protect,
  [body('rawMessage').notEmpty().trim().withMessage('Message zaroori hai')],
  createPost
);

router.delete('/:id', protect, deletePost);

module.exports = router;
