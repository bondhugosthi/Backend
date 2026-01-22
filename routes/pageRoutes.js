const express = require('express');
const router = express.Router();
const {
  getPageByName,
  getAllPages,
  updatePage,
  updatePageSection,
  deletePageSection
} = require('../controllers/pageController');
const { protect } = require('../middleware/auth');

router.get('/', getAllPages);
router.get('/:pageName', getPageByName);

// Protected routes
router.put('/:pageName', protect, updatePage);
router.put('/:pageName/sections/:sectionId', protect, updatePageSection);
router.delete('/:pageName/sections/:sectionId', protect, deletePageSection);

module.exports = router;
