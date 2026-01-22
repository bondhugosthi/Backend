const News = require('../models/News');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const { type, category, isImportant } = req.query;
    let query = { isPublished: true };

    if (type) query.type = type;
    if (category) query.category = category;
    if (isImportant) query.isImportant = isImportant === 'true';

    const news = await News.find(query)
      .sort({ isImportant: -1, publishDate: -1 })
      .populate('createdBy', 'email');

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('createdBy', 'email');

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private
const createNews = async (req, res) => {
  try {
    const newsData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const news = await News.create(newsData);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'news',
      description: `Created news: ${news.title}`,
      resourceId: news._id
    });

    res.status(201).json(news);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create news', error: error.message });
  }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private
const updateNews = async (req, res) => {
  try {
    const news = await News.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'news',
      description: `Updated news: ${news.title}`,
      resourceId: news._id
    });

    res.json(news);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update news', error: error.message });
  }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }

    await news.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'news',
      description: `Deleted news: ${news.title}`,
      resourceId: news._id
    });

    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
};