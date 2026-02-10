const Event = require('../models/Event');
const { Tournament } = require('../models/Sport');
const SocialWork = require('../models/SocialWork');
const Member = require('../models/Member');

// @desc    Get public stats for homepage
// @route   GET /api/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const [totalEvents, totalMembers, totalSocialWork, totalTournaments, totalPeopleHelped] = await Promise.all([
      Event.countDocuments(),
      Member.countDocuments({ isActive: true }),
      SocialWork.countDocuments({ isPublished: true }),
      Tournament.countDocuments(),
      SocialWork.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: null, total: { $sum: '$impact.peopleHelped' } } }
      ])
    ]);

    res.json({
      events: totalEvents,
      members: totalMembers,
      socialWork: totalSocialWork,
      tournaments: totalTournaments,
      peopleHelped: totalPeopleHelped[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPublicStats
};
