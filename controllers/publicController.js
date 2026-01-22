const Event = require('../models/Event');
const { Tournament } = require('../models/Sport');
const SocialWork = require('../models/SocialWork');
const Member = require('../models/Member');

// @desc    Get public stats for homepage
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const [totalEvents, totalMembers, totalSocialWork, totalTournaments] = await Promise.all([
      Event.countDocuments(),
      Member.countDocuments({ isActive: true }),
      SocialWork.countDocuments({ isPublished: true }),
      Tournament.countDocuments()
    ]);

    res.json({
      events: totalEvents,
      members: totalMembers,
      socialWork: totalSocialWork,
      tournaments: totalTournaments
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPublicStats
};
