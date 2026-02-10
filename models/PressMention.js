const mongoose = require('mongoose');

const pressMentionSchema = new mongoose.Schema({
  outlet: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  date: Date,
  logo: String,
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

pressMentionSchema.index({ isPublished: 1, order: 1, date: -1 });

module.exports = mongoose.model('PressMention', pressMentionSchema);
