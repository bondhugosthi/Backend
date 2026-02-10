const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    enum: ['home', 'about', 'contact', 'footer', 'events', 'social-work', 'gallery', 'members', 'news']
  },
  sections: [{
    sectionName: String,
    title: String,
    content: String,
    images: [String],
    order: Number
  }],
  seo: {
    title: String,
    description: String,
    keywords: [String],
    ogImage: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

module.exports = mongoose.model('Page', pageSchema);
