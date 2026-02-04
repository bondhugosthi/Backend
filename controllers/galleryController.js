const Gallery = require('../models/Gallery');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all galleries
// @route   GET /api/gallery
// @access  Public
const getGalleries = async (req, res) => {
  try {
    const { category, year } = req.query;
    let query = { isPublished: true };

    if (category) query.category = category;
    if (year) query.year = parseInt(year);

    const galleries = await Gallery.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'email');

    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single gallery
// @route   GET /api/gallery/:id
// @access  Public
const getGalleryById = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Increment views
    gallery.views += 1;
    await gallery.save();

    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create gallery
// @route   POST /api/gallery
// @access  Private
const createGallery = async (req, res) => {
  try {
    const galleryData = {
      ...req.body,
      createdBy: req.admin._id
    };

    // Set year from date if provided
    if (galleryData.date) {
      galleryData.year = new Date(galleryData.date).getFullYear();
    }

    const gallery = await Gallery.create(galleryData);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'gallery',
      description: `Created gallery: ${gallery.albumName}`,
      resourceId: gallery._id
    });

    res.status(201).json(gallery);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create gallery', error: error.message });
  }
};

// @desc    Update gallery
// @route   PUT /api/gallery/:id
// @access  Private
const updateGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'gallery',
      description: `Updated gallery: ${gallery.albumName}`,
      resourceId: gallery._id
    });

    res.json(gallery);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update gallery', error: error.message });
  }
};

// @desc    Delete gallery
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    await gallery.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'gallery',
      description: `Deleted gallery: ${gallery.albumName}`,
      resourceId: gallery._id
    });

    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add media to gallery
// @route   POST /api/gallery/:id/media
// @access  Private
const addMediaToGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const newMedia = Array.isArray(req.body.media) ? req.body.media : [];
    if (newMedia.length === 0) {
      return res.status(400).json({ message: 'No media provided' });
    }

    gallery.media.push(...newMedia);

    if (!gallery.coverImage) {
      const firstImage = newMedia.find((item) => item && item.type !== 'video' && item.url)
        || newMedia.find((item) => item && item.url);
      if (firstImage?.url) {
        gallery.coverImage = firstImage.url;
      }
    }

    await gallery.save();

    res.json(gallery);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add media', error: error.message });
  }
};

module.exports = {
  getGalleries,
  getGalleryById,
  createGallery,
  updateGallery,
  deleteGallery,
  addMediaToGallery
};
