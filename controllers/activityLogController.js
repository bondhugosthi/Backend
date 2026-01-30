const ActivityLog = require('../models/ActivityLog');
const { getRetentionDate } = require('../utils/activityRetention');

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// @desc    Get activity logs
// @route   GET /api/activity-logs
// @access  Private
const getActivityLogs = async (req, res) => {
  try {
    const { admin, module, action, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = {};
    const retentionDate = getRetentionDate();

    if (admin) query.admin = admin;
    if (module) query.module = module;
    if (action) query.action = action;
    const timestampQuery = { $gte: retentionDate };
    const start = startDate ? parseDate(startDate) : null;
    const end = endDate ? parseDate(endDate) : null;
    if (start && start > retentionDate) {
      timestampQuery.$gte = start;
    }
    if (end) {
      timestampQuery.$lte = end;
    }
    query.timestamp = timestampQuery;

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
    const retentionDate = getRetentionDate();
    const log = await ActivityLog.findOne({ _id: req.params.id, timestamp: { $gte: retentionDate } })
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
    const retentionDate = getRetentionDate();
    const actionStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: retentionDate } } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    const moduleStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: retentionDate } } },
      { $group: { _id: '$module', count: { $sum: 1 } } }
    ]);

    const adminStats = await ActivityLog.aggregate([
      { $match: { timestamp: { $gte: retentionDate } } },
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
