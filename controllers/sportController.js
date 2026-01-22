const { Sport, Tournament } = require('../models/Sport');
const ActivityLog = require('../models/ActivityLog');

// Sports Controllers
const getSports = async (req, res) => {
  try {
    const sports = await Sport.find({ isActive: true })
      .populate('tournaments')
      .sort({ name: 1 });
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createSport = async (req, res) => {
  try {
    const sport = await Sport.create(req.body);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'sports',
      description: `Created sport: ${sport.name}`,
      resourceId: sport._id
    });

    res.status(201).json(sport);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create sport', error: error.message });
  }
};

const updateSport = async (req, res) => {
  try {
    const sport = await Sport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sport) {
      return res.status(404).json({ message: 'Sport not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'sports',
      description: `Updated sport: ${sport.name}`,
      resourceId: sport._id
    });

    res.json(sport);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update sport', error: error.message });
  }
};

const deleteSport = async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);

    if (!sport) {
      return res.status(404).json({ message: 'Sport not found' });
    }

    await sport.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'sports',
      description: `Deleted sport: ${sport.name}`,
      resourceId: sport._id
    });

    res.json({ message: 'Sport deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tournament Controllers
const getTournaments = async (req, res) => {
  try {
    const { sportId, status } = req.query;
    let query = {};

    if (sportId) query.sport = sportId;
    if (status) query.status = status;

    const tournaments = await Tournament.find(query)
      .populate('sport')
      .sort({ startDate: -1 });

    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id).populate('sport');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    res.json(tournament);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create(req.body);

    // Add tournament to sport
    await Sport.findByIdAndUpdate(
      tournament.sport,
      { $push: { tournaments: tournament._id } }
    );

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'sports',
      description: `Created tournament: ${tournament.name}`,
      resourceId: tournament._id
    });

    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create tournament', error: error.message });
  }
};

const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.isLocked && req.body.matches) {
      return res.status(403).json({ message: 'Tournament is locked and cannot be modified' });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'sports',
      description: `Updated tournament: ${updatedTournament.name}`,
      resourceId: updatedTournament._id
    });

    res.json(updatedTournament);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update tournament', error: error.message });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Remove tournament from sport
    await Sport.findByIdAndUpdate(
      tournament.sport,
      { $pull: { tournaments: tournament._id } }
    );

    await tournament.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'sports',
      description: `Deleted tournament: ${tournament.name}`,
      resourceId: tournament._id
    });

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSports,
  createSport,
  updateSport,
  deleteSport,
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament
};