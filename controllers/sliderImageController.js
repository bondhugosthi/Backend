const SliderImage = require('../models/SliderImage');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get slider images for public site
// @route   GET /api/slider-images
// @access  Public
const getSliderImages = async (req, res) => {
  try {
    const parsedLimit = parseInt(req.query.limit, 10);
    const limit = Number.isNaN(parsedLimit) ? 3 : Math.min(Math.max(parsedLimit, 1), 10);

    const images = await SliderImage.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all slider images (admin)
// @route   GET /api/slider-images/admin
// @access  Private
const getSliderImagesAdmin = async (req, res) => {
  try {
    const images = await SliderImage.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'email');

    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create slider image
// @route   POST /api/slider-images
// @access  Private
const createSliderImage = async (req, res) => {
  try {
    const { imageUrl, title, isActive } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const sliderImage = await SliderImage.create({
      imageUrl,
      title,
      isActive: isActive !== false,
      createdBy: req.admin._id
    });

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'slider_images',
      description: `Created slider image${sliderImage.title ? `: ${sliderImage.title}` : ''}`,
      resourceId: sliderImage._id
    });

    res.status(201).json(sliderImage);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create slider image', error: error.message });
  }
};

// @desc    Update slider image
// @route   PUT /api/slider-images/:id
// @access  Private
const updateSliderImage = async (req, res) => {
  try {
    const updates = {};
    ['title', 'imageUrl', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const sliderImage = await SliderImage.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!sliderImage) {
      return res.status(404).json({ message: 'Slider image not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'slider_images',
      description: `Updated slider image${sliderImage.title ? `: ${sliderImage.title}` : ''}`,
      resourceId: sliderImage._id
    });

    res.json(sliderImage);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update slider image', error: error.message });
  }
};

// @desc    Delete slider image
// @route   DELETE /api/slider-images/:id
// @access  Private
const deleteSliderImage = async (req, res) => {
  try {
    const sliderImage = await SliderImage.findById(req.params.id);

    if (!sliderImage) {
      return res.status(404).json({ message: 'Slider image not found' });
    }

    await sliderImage.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'slider_images',
      description: `Deleted slider image${sliderImage.title ? `: ${sliderImage.title}` : ''}`,
      resourceId: sliderImage._id
    });

    res.json({ message: 'Slider image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSliderImages,
  getSliderImagesAdmin,
  createSliderImage,
  updateSliderImage,
  deleteSliderImage
};
