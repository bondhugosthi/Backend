const Page = require('../models/Page');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get page by name
// @route   GET /api/pages/:pageName
// @access  Public
const getPageByName = async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: req.params.pageName })
      .populate('updatedBy', 'email');

    if (!page) {
      return res.json({
        pageName: req.params.pageName,
        sections: [],
        seo: {}
      });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().populate('updatedBy', 'email');
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update page
// @route   PUT /api/pages/:pageName
// @access  Private
const updatePage = async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      lastUpdated: new Date(),
      updatedBy: req.admin._id
    };

    const page = await Page.findOneAndUpdate(
      { pageName: req.params.pageName },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'pages',
      description: `Updated page: ${page.pageName}`,
      resourceId: page._id
    });

    res.json(page);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update page', error: error.message });
  }
};

// @desc    Update page section
// @route   PUT /api/pages/:pageName/sections/:sectionId
// @access  Private
const updatePageSection = async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: req.params.pageName });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const sectionIndex = page.sections.findIndex(
      s => s._id.toString() === req.params.sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({ message: 'Section not found' });
    }

    page.sections[sectionIndex] = {
      ...page.sections[sectionIndex],
      ...req.body
    };

    page.lastUpdated = new Date();
    page.updatedBy = req.admin._id;

    await page.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'pages',
      description: `Updated section in page: ${page.pageName}`,
      resourceId: page._id
    });

    res.json(page);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update section', error: error.message });
  }
};

// @desc    Delete page section
// @route   DELETE /api/pages/:pageName/sections/:sectionId
// @access  Private
const deletePageSection = async (req, res) => {
  try {
    const page = await Page.findOne({ pageName: req.params.pageName });

    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }

    const sectionIndex = page.sections.findIndex(
      s => s._id.toString() === req.params.sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({ message: 'Section not found' });
    }

    page.sections.splice(sectionIndex, 1);
    page.lastUpdated = new Date();
    page.updatedBy = req.admin._id;

    await page.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'pages',
      description: `Deleted section in page: ${page.pageName}`,
      resourceId: page._id
    });

    res.json(page);
  } catch (error) {
    res.status(400).json({ message: 'Failed to delete section', error: error.message });
  }
};

module.exports = {
  getPageByName,
  getAllPages,
  updatePage,
  updatePageSection,
  deletePageSection
};
