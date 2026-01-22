const express = require('express');
const router = express.Router();
const {
  getGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  addMediaToGallery
} = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');

router.get('/', getGalleries);
router.get('/:id', getGalleryById);

// Protected routes
router.post('/', protect, createGallery);
router.put('/:id', protect, updateGallery);
router.delete('/:id', protect, deleteGallery);
router.post('/:id/media', protect, addMediaToGallery);

module.exports = router;