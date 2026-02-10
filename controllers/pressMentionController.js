const PressMention = require('../models/PressMention');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all press mentions
// @route   GET /api/press-mentions
// @access  Public
const getPressMentions = async (req, res) => {
  try {
    const { limit, isPublished } = req.query;
    const query = {};

    if (isPublished === undefined) {
      query.isPublished = true;
    } else {
      query.isPublished = isPublished === 'true';
    }

    let request = PressMention.find(query)
      .sort({ order: 1, date: -1, createdAt: -1 })
      .populate('createdBy', 'email');

    if (limit) {
      request = request.limit(Number(limit));
    }

    const mentions = await request;
    res.json(mentions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single press mention
// @route   GET /api/press-mentions/:id
// @access  Public
const getPressMentionById = async (req, res) => {
  try {
    const mention = await PressMention.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!mention) {
      return res.status(404).json({ message: 'Press mention not found' });
    }

    res.json(mention);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create press mention
// @route   POST /api/press-mentions
// @access  Private
const createPressMention = async (req, res) => {
  try {
    const mentionData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const mention = await PressMention.create(mentionData);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'press_mentions',
      description: `Created press mention: ${mention.outlet}`,
      resourceId: mention._id
    });

    res.status(201).json(mention);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create press mention', error: error.message });
  }
};

// @desc    Update press mention
// @route   PUT /api/press-mentions/:id
// @access  Private
const updatePressMention = async (req, res) => {
  try {
    const mention = await PressMention.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!mention) {
      return res.status(404).json({ message: 'Press mention not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'press_mentions',
      description: `Updated press mention: ${mention.outlet}`,
      resourceId: mention._id
    });

    res.json(mention);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update press mention', error: error.message });
  }
};

// @desc    Delete press mention
// @route   DELETE /api/press-mentions/:id
// @access  Private
const deletePressMention = async (req, res) => {
  try {
    const mention = await PressMention.findById(req.params.id);

    if (!mention) {
      return res.status(404).json({ message: 'Press mention not found' });
    }

    await mention.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'press_mentions',
      description: `Deleted press mention: ${mention.outlet}`,
      resourceId: mention._id
    });

    res.json({ message: 'Press mention deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPressMentions,
  getPressMentionById,
  createPressMention,
  updatePressMention,
  deletePressMention
};
