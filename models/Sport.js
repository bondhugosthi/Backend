const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['cricket', 'football', 'volleyball', 'badminton', 'athletics', 'other'],
    required: true
  },
  description: String,
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  },
  tournaments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sport',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  venue: String,
  format: {
    type: String,
    enum: ['team', 'individual'],
    default: 'team'
  },
  teams: [{
    name: String,
    players: [String]
  }],
  matches: [{
    team1: String,
    team2: String,
    score1: String,
    score2: String,
    date: Date,
    winner: String
  }],
  winners: {
    first: String,
    second: String,
    third: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sport = mongoose.model('Sport', sportSchema);
const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = { Sport, Tournament };