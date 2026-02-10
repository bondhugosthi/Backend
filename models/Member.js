const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['president', 'vice_president', 'secretary', 'treasurer', 'sports_head', 'cultural_head', 'volunteer', 'member']
  },
  photo: String,
  email: String,
  phone: String,
  joinDate: Date,
  bio: String,
  achievements: [String],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  isSpotlight: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  },
  committee: {
    year: Number,
    position: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Sort by priority and role
memberSchema.index({ priority: -1, role: 1 });

module.exports = mongoose.model('Member', memberSchema);
