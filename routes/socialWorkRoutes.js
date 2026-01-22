const express = require('express');
const router = express.Router();
const {
  getSocialWork,
  getSocialWorkById,
  createSocialWork,
  updateSocialWork,
  deleteSocialWork,
  getImpactSummary
} = require('../controllers/socialWorkController');
const { protect } = require('../middleware/auth');

router.get('/', getSocialWork);
router.get('/impact/summary', getImpactSummary);
router.get('/:id', getSocialWorkById);

// Protected routes
router.post('/', protect, createSocialWork);
router.put('/:id', protect, updateSocialWork);
router.delete('/:id', protect, deleteSocialWork);

module.exports = router;