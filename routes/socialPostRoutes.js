const express = require('express');
const router = express.Router();
const {
  getSocialPosts,
  getSocialPostById,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost
} = require('../controllers/socialPostController');
const { protect } = require('../middleware/auth');

router.get('/', getSocialPosts);
router.get('/:id', getSocialPostById);

// Protected routes
router.post('/', protect, createSocialPost);
router.put('/:id', protect, updateSocialPost);
router.delete('/:id', protect, deleteSocialPost);

module.exports = router;
