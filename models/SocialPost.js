const mongoose = require('mongoose');

const socialPostSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'youtube', 'twitter', 'linkedin', 'other'],
    default: 'facebook'
  },
  title: String,
  caption: String,
  url: {
    type: String,
    required: true,
    trim: true
  },
  image: String,
  postedAt: Date,
  isPublished: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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

socialPostSchema.index({ isPublished: 1, order: 1, postedAt: -1 });

module.exports = mongoose.model('SocialPost', socialPostSchema);
