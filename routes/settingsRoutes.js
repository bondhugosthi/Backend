const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  updateSocialMedia,
  updateSEO
} = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.get('/', getSettings);

// Protected routes
router.put('/', protect, updateSettings);
router.put('/social-media', protect, updateSocialMedia);
router.put('/seo', protect, updateSEO);

module.exports = router;