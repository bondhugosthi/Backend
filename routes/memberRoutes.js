const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getCommitteeByYear,
  getLatestCommittee
} = require('../controllers/memberController');
const { protect } = require('../middleware/auth');

router.get('/', getMembers);
router.get('/committee/latest', getLatestCommittee);
router.get('/committee/:year', getCommitteeByYear);
router.get('/:id', getMemberById);

// Protected routes
router.post('/', protect, createMember);
router.put('/:id', protect, updateMember);
router.delete('/:id', protect, deleteMember);

module.exports = router;
