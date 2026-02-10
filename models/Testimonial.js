const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: String,
  quote: {
    type: String,
    required: true,
    trim: true
  },
  photo: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
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

testimonialSchema.index({ isPublished: 1, order: 1, createdAt: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
