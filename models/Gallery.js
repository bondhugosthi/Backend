const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  albumName: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: ['events', 'sports', 'social_work', 'december_moments', 'puja', 'other'],
    default: 'other'
  },
  coverImage: String,
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    url: String,
    thumbnail: String,
    caption: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  date: Date,
  year: Number,
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Gallery', gallerySchema);