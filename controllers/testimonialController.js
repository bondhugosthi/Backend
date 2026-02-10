const Testimonial = require('../models/Testimonial');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
const getTestimonials = async (req, res) => {
  try {
    const { limit, isPublished } = req.query;
    const query = {};

    if (isPublished !== 'false') {
      query.isPublished = true;
    }

    let request = Testimonial.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('createdBy', 'email');

    if (limit) {
      request = request.limit(Number(limit));
    }

    const testimonials = await request;
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single testimonial
// @route   GET /api/testimonials/:id
// @access  Public
const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create testimonial
// @route   POST /api/testimonials
// @access  Private
const createTestimonial = async (req, res) => {
  try {
    const testimonialData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const testimonial = await Testimonial.create(testimonialData);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'testimonials',
      description: `Created testimonial for ${testimonial.name}`,
      resourceId: testimonial._id
    });

    res.status(201).json(testimonial);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create testimonial', error: error.message });
  }
};

// @desc    Update testimonial
// @route   PUT /api/testimonials/:id
// @access  Private
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'testimonials',
      description: `Updated testimonial for ${testimonial.name}`,
      resourceId: testimonial._id
    });

    res.json(testimonial);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update testimonial', error: error.message });
  }
};

// @desc    Delete testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await testimonial.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'testimonials',
      description: `Deleted testimonial for ${testimonial.name}`,
      resourceId: testimonial._id
    });

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
};
