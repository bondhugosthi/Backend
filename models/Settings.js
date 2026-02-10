const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    default: 'Bondhu Gosthi'
  },
  tagline: String,
  logo: String,
  favicon: String,
  contactDetails: {
    email: String,
    phone: String,
    address: String,
    mapLink: String
  },
  businessHours: [
    {
      day: String,
      open: String,
      close: String,
      isClosed: {
        type: Boolean,
        default: false
      }
    }
  ],
  brochureUrl: String,
  brochureLabel: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    linkedin: String
  },
  seo: {
    defaultTitle: String,
    defaultDescription: String,
    defaultKeywords: [String],
    ogImage: String
  },
  maintenance: {
    isEnabled: {
      type: Boolean,
      default: false
    },
    message: String
  },
  analytics: {
    googleAnalyticsId: String,
    facebookPixelId: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
