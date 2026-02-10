const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['tournament', 'puja', 'cultural', 'social', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  endDate: Date,
  time: String,
  location: String,
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  images: [String],
  coverImage: String,
  gallery: [{
    url: String,
    caption: String
  }],
  organizer: String,
  participants: Number,
  results: {
    winners: [String],
    summary: String
  },
  isHighlight: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Auto-archive past events
eventSchema.pre('save', function(next) {
  if (this.date < new Date() && this.status === 'upcoming') {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
