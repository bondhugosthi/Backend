const mongoose = require('mongoose');

const sliderImageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SliderImage', sliderImageSchema);
