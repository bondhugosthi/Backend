const express = require('express');
const router = express.Router();
const {
  getActivityLogs,
  getActivityLogById,
  getActivityStats
} = require('../controllers/activityLogController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and require super_admin role
router.get('/', protect, authorize('super_admin'), getActivityLogs);
router.get('/stats', protect, authorize('super_admin'), getActivityStats);
router.get('/:id', protect, authorize('super_admin'), getActivityLogById);

module.exports = router;