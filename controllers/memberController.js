const Member = require('../models/Member');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all members
// @route   GET /api/members
// @access  Public
const getMembers = async (req, res) => {
  try {
    const { role, year, isActive, isSpotlight } = req.query;
    let query = {};

    if (role) query.role = role;
    if (year) query['committee.year'] = parseInt(year);
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (isSpotlight !== undefined) query.isSpotlight = isSpotlight === 'true';

    const members = await Member.find(query)
      .sort({ priority: -1, role: 1, name: 1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Public
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create member
// @route   POST /api/members
// @access  Private
const createMember = async (req, res) => {
  try {
    // Check for duplicate email
    if (req.body.email) {
      const existingMember = await Member.findOne({ email: req.body.email });
      if (existingMember) {
        return res.status(400).json({ message: 'Member with this email already exists' });
      }
    }

    const member = await Member.create(req.body);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'members',
      description: `Created member: ${member.name}`,
      resourceId: member._id
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create member', error: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'members',
      description: `Updated member: ${member.name}`,
      resourceId: member._id
    });

    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update member', error: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Private
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await member.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'members',
      description: `Deleted member: ${member.name}`,
      resourceId: member._id
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get committee members by year
// @route   GET /api/members/committee/:year
// @access  Public
const getCommitteeByYear = async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const members = await Member.find({
      'committee.year': year,
      isActive: true
    }).sort({ priority: -1, role: 1 });

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getCommitteeByYear
};
