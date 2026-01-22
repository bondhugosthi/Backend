const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, password, role, isActive } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await Admin.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({
      email: normalizedEmail,
      password,
      role: role || 'super_admin',
      isActive: isActive !== false
    });

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'auth',
      description: `Created admin: ${admin.email}`,
      resourceId: admin._id,
      resourceType: 'Admin'
    });

    res.status(201).json({
      _id: admin._id,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create admin', error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const isSelf = req.admin._id.toString() === admin._id.toString();
    const nextRole = req.body.role || admin.role;
    const nextIsActive = req.body.isActive !== undefined ? req.body.isActive : admin.isActive;

    if (admin.role === 'super_admin' && (nextRole !== 'super_admin' || nextIsActive === false)) {
      const otherSuperAdmins = await Admin.countDocuments({
        _id: { $ne: admin._id },
        role: 'super_admin',
        isActive: true
      });
      if (otherSuperAdmins === 0) {
        return res.status(400).json({ message: 'At least one active super admin is required' });
      }
    }

    if (isSelf && nextIsActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    if (req.body.email) {
      const updatedEmail = String(req.body.email || '').trim().toLowerCase();
      if (!updatedEmail) {
        return res.status(400).json({ message: 'Email is required' });
      }
      if (updatedEmail !== admin.email) {
        const emailExists = await Admin.findOne({ email: updatedEmail });
        if (emailExists) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
        admin.email = updatedEmail;
      }
    }

    admin.role = nextRole;
    admin.isActive = nextIsActive;

    const updatedAdmin = await admin.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'auth',
      description: `Updated admin: ${updatedAdmin.email}`,
      resourceId: updatedAdmin._id,
      resourceType: 'Admin'
    });

    res.json({
      _id: updatedAdmin._id,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      isActive: updatedAdmin.isActive,
      lastLogin: updatedAdmin.lastLogin,
      createdAt: updatedAdmin.createdAt
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update admin', error: error.message });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.password = password;
    await admin.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'auth',
      description: `Reset password for admin: ${admin.email}`,
      resourceId: admin._id,
      resourceType: 'Admin'
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Failed to reset password', error: error.message });
  }
};

module.exports = {
  getAdmins,
  createAdmin,
  updateAdmin,
  resetAdminPassword
};
