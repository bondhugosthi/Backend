const express = require('express');
const router = express.Router();
const {
  getContacts,
  getContactById,
  createContact,
  replyContact,
  updateContactStatus,
  deleteContact,
  getContactStats
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/', contactLimiter, createContact);

// Protected routes
router.get('/', protect, getContacts);
router.get('/stats', protect, getContactStats);
router.get('/:id', protect, getContactById);
router.put('/:id/reply', protect, replyContact);
router.put('/:id/status', protect, updateContactStatus);
router.delete('/:id', protect, deleteContact);

module.exports = router;