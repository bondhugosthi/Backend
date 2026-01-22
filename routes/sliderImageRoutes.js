const express = require('express');
const router = express.Router();
const {
  getSliderImages,
  getSliderImagesAdmin,
  createSliderImage,
  updateSliderImage,
  deleteSliderImage
} = require('../controllers/sliderImageController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/', getSliderImages);

// Admin routes
router.get('/admin', protect, getSliderImagesAdmin);
router.post('/', protect, createSliderImage);
router.put('/:id', protect, updateSliderImage);
router.delete('/:id', protect, deleteSliderImage);

module.exports = router;
