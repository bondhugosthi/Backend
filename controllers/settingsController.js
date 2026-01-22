const Settings = require('../models/Settings');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        websiteName: 'Bondhu Gosthi',
        tagline: 'A family of friends',
        contactDetails: {
          email: 'bondhugosthi2010@gmail.com'
        }
      });
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.admin._id
    };

    let settings = await Settings.findOne();

    if (!settings) {
      settings = await Settings.create(updateData);
    } else {
      settings = await Settings.findByIdAndUpdate(
        settings._id,
        updateData,
        { new: true, runValidators: true }
      );
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'settings',
      description: 'Updated website settings',
      resourceId: settings._id
    });

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update settings', error: error.message });
  }
};

// @desc    Update social media links
// @route   PUT /api/settings/social-media
// @access  Private
const updateSocialMedia = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.socialMedia = {
      ...settings.socialMedia,
      ...req.body
    };
    settings.updatedAt = new Date();
    settings.updatedBy = req.admin._id;

    await settings.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'settings',
      description: 'Updated social media links',
      resourceId: settings._id
    });

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update social media', error: error.message });
  }
};

// @desc    Update SEO settings
// @route   PUT /api/settings/seo
// @access  Private
const updateSEO = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    settings.seo = {
      ...settings.seo,
      ...req.body
    };
    settings.updatedAt = new Date();
    settings.updatedBy = req.admin._id;

    await settings.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'settings',
      description: 'Updated SEO settings',
      resourceId: settings._id
    });

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update SEO', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  updateSocialMedia,
  updateSEO
};