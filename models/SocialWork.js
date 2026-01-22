const mongoose = require('mongoose');

const socialWorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['food_distribution', 'education', 'health', 'disaster_relief', 'community_service', 'other'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  location: String,
  impact: {
    peopleHelped: Number,
    description: String
  },
  volunteers: [String],
  images: [String],
  coverImage: String,
  isPublished: {
    type: Boolean,
    default: true
  },
  year: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Auto-set year before saving
socialWorkSchema.pre('save', function(next) {
  if (this.date) {
    this.year = this.date.getFullYear();
  }
  next();
});

module.exports = mongoose.model('SocialWork', socialWorkSchema);