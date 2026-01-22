const SocialWork = require('../models/SocialWork');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all social work activities
// @route   GET /api/social-work
// @access  Public
const getSocialWork = async (req, res) => {
  try {
    const { year, category } = req.query;
    let query = { isPublished: true };

    if (year) query.year = parseInt(year);
    if (category) query.category = category;

    const socialWork = await SocialWork.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'email');

    res.json(socialWork);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single social work
// @route   GET /api/social-work/:id
// @access  Public
const getSocialWorkById = async (req, res) => {
  try {
    const socialWork = await SocialWork.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!socialWork) {
      return res.status(404).json({ message: 'Social work not found' });
    }

    res.json(socialWork);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create social work
// @route   POST /api/social-work
// @access  Private
const createSocialWork = async (req, res) => {
  try {
    const socialWorkData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const socialWork = await SocialWork.create(socialWorkData);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'social_work',
      description: `Created social work: ${socialWork.title}`,
      resourceId: socialWork._id
    });

    res.status(201).json(socialWork);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create social work', error: error.message });
  }
};

// @desc    Update social work
// @route   PUT /api/social-work/:id
// @access  Private
const updateSocialWork = async (req, res) => {
  try {
    const socialWork = await SocialWork.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!socialWork) {
      return res.status(404).json({ message: 'Social work not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'social_work',
      description: `Updated social work: ${socialWork.title}`,
      resourceId: socialWork._id
    });

    res.json(socialWork);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update social work', error: error.message });
  }
};

// @desc    Delete social work
// @route   DELETE /api/social-work/:id
// @access  Private
const deleteSocialWork = async (req, res) => {
  try {
    const socialWork = await SocialWork.findById(req.params.id);

    if (!socialWork) {
      return res.status(404).json({ message: 'Social work not found' });
    }

    await socialWork.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'social_work',
      description: `Deleted social work: ${socialWork.title}`,
      resourceId: socialWork._id
    });

    res.json({ message: 'Social work deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get impact summary
// @route   GET /api/social-work/impact/summary
// @access  Public
const getImpactSummary = async (req, res) => {
  try {
    const totalActivities = await SocialWork.countDocuments({ isPublished: true });
    
    const totalPeopleHelped = await SocialWork.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, total: { $sum: '$impact.peopleHelped' } } }
    ]);

    const categoryCounts = await SocialWork.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      totalActivities,
      totalPeopleHelped: totalPeopleHelped[0]?.total || 0,
      categoryCounts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSocialWork,
  getSocialWorkById,
  createSocialWork,
  updateSocialWork,
  deleteSocialWork,
  getImpactSummary
};