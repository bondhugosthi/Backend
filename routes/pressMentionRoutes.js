const express = require('express');
const router = express.Router();
const {
  getPressMentions,
  getPressMentionById,
  createPressMention,
  updatePressMention,
  deletePressMention
} = require('../controllers/pressMentionController');
const { protect } = require('../middleware/auth');

router.get('/', getPressMentions);
router.get('/:id', getPressMentionById);

// Protected routes
router.post('/', protect, createPressMention);
router.put('/:id', protect, updatePressMention);
router.delete('/:id', protect, deletePressMention);

module.exports = router;
