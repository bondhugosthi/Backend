const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdmins,
  createAdmin,
  updateAdmin,
  resetAdminPassword
} = require('../controllers/adminController');

router.use(protect, authorize('super_admin'));

router.get('/', getAdmins);
router.post('/', createAdmin);
router.put('/:id', updateAdmin);
router.put('/:id/password', resetAdminPassword);

module.exports = router;
