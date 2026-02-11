const mongoose = require('mongoose');
const { ACTIVITY_RETENTION_SECONDS } = require('../utils/activityRetention');

const activityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'backup', 'restore']
  },
  module: {
    type: String,
    required: true,
    enum: [
      'events',
      'sports',
      'social_work',
      'gallery',
      'slider_images',
      'members',
      'news',
      'contact',
      'pages',
      'settings',
      'auth',
      'testimonials',
      'social_posts',
      'press_mentions'
    ]
  },
  description: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  resourceType: String,
  ipAddress: String,
  userAgent: String,
  changes: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activityLogSchema.index({ admin: 1, timestamp: -1 });
activityLogSchema.index({ module: 1, timestamp: -1 });
activityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: ACTIVITY_RETENTION_SECONDS });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
