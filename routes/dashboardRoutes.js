const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getSystemHealth
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/health', protect, getSystemHealth);

module.exports = router;