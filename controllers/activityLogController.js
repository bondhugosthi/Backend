const ActivityLog = require('../models/ActivityLog');

// @desc    Get activity logs
// @route   GET /api/activity-logs
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const { admin, module, action, startDate, endDate, page = 1, limit = 50 } = req.query;
    let query = {};

    if (admin) query.admin = admin;
    if (module) query.module = module;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('admin', 'email role');

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get activity log by ID
// @route   GET /api/activity-logs/:id
// @access  Private
const getActivityLogById = async (req, res) => {
  try {
    const log = await ActivityLog.findById(req.params.id)
      .populate('admin', 'email role');

    if (!log) {
      return res.status(404).json({ message: 'Activity log not found' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get activity statistics
// @route   GET /api/activity-logs/stats
// @access  Private
const getActivityStats = async (req, res) => {
  try {
    const actionStats = await ActivityLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    const moduleStats = await ActivityLog.aggregate([
      { $group: { _id: '$module', count: { $sum: 1 } } }
    ]);

    const adminStats = await ActivityLog.aggregate([
      {
        $group: {
          _id: '$admin',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $lookup: {
          from: 'admins',
          localField: '_id',
          foreignField: '_id',
          as: 'adminInfo'
        }
      }
    ]);

    res.json({
      actionStats,
      moduleStats,
      adminStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getActivityLogs,
  getActivityLogById,
  getActivityStats
};