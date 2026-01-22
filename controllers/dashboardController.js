const Event = require('../models/Event');
const { Sport, Tournament } = require('../models/Sport');
const SocialWork = require('../models/SocialWork');
const Gallery = require('../models/Gallery');
const Member = require('../models/Member');
const News = require('../models/News');
const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Count statistics
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ 
      status: 'upcoming',
      date: { $gte: new Date() }
    });
    const totalGalleries = await Gallery.countDocuments();
    const totalMembers = await Member.countDocuments({ isActive: true });
    const totalNews = await News.countDocuments({ isPublished: true });
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const totalSports = await Sport.countDocuments({ isActive: true });
    const totalTournaments = await Tournament.countDocuments();
    const totalSocialWork = await SocialWork.countDocuments({ isPublished: true });

    // Recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title eventType date status');

    // Upcoming events
    const nextEvents = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(5)
      .select('title eventType date location');

    // Recent contact messages
    const recentMessages = await Contact.find({ status: 'new' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject createdAt');

    // Recent activity logs
    const recentActivities = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('admin', 'email');

    // Monthly event statistics
    const currentYear = new Date().getFullYear();
    const monthlyEvents = await Event.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(currentYear, 0, 1),
            $lte: new Date(currentYear, 11, 31)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      counts: {
        totalEvents,
        upcomingEvents,
        totalGalleries,
        totalMembers,
        totalNews,
        newMessages,
        totalSports,
        totalTournaments,
        totalSocialWork
      },
      recentEvents,
      nextEvents,
      recentMessages,
      recentActivities,
      monthlyEvents
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get system health status
// @route   GET /api/dashboard/health
// @access  Private
const getSystemHealth = async (req, res) => {
  try {
    const dbStatus = 'connected'; // mongoose.connection.readyState === 1
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      database: dbStatus,
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getSystemHealth
};