const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['news', 'notice', 'announcement', 'festival'],
    default: 'news'
  },
  category: String,
  image: String,
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  isImportant: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

// Auto-hide expired notices
newsSchema.pre('find', function() {
  const now = new Date();
  this.where({
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gte: now } }
    ]
  });
});

module.exports = mongoose.model('News', newsSchema);