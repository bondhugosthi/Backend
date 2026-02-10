const SocialPost = require('../models/SocialPost');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all social posts
// @route   GET /api/social-posts
// @access  Public
const getSocialPosts = async (req, res) => {
  try {
    const { limit, isPublished } = req.query;
    const query = {};

    if (isPublished === undefined) {
      query.isPublished = true;
    } else {
      query.isPublished = isPublished === 'true';
    }

    let request = SocialPost.find(query)
      .sort({ order: 1, postedAt: -1, createdAt: -1 })
      .populate('createdBy', 'email');

    if (limit) {
      request = request.limit(Number(limit));
    }

    const posts = await request;
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single social post
// @route   GET /api/social-posts/:id
// @access  Public
const getSocialPostById = async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id).populate('createdBy', 'email');

    if (!post) {
      return res.status(404).json({ message: 'Social post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create social post
// @route   POST /api/social-posts
// @access  Private
const createSocialPost = async (req, res) => {
  try {
    const postData = {
      ...req.body,
      createdBy: req.admin._id
    };

    const post = await SocialPost.create(postData);

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'social_posts',
      description: `Created social post: ${post.platform}`,
      resourceId: post._id
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create social post', error: error.message });
  }
};

// @desc    Update social post
// @route   PUT /api/social-posts/:id
// @access  Private
const updateSocialPost = async (req, res) => {
  try {
    const post = await SocialPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Social post not found' });
    }

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'social_posts',
      description: `Updated social post: ${post.platform}`,
      resourceId: post._id
    });

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update social post', error: error.message });
  }
};

// @desc    Delete social post
// @route   DELETE /api/social-posts/:id
// @access  Private
const deleteSocialPost = async (req, res) => {
  try {
    const post = await SocialPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Social post not found' });
    }

    await post.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'social_posts',
      description: `Deleted social post: ${post.platform}`,
      resourceId: post._id
    });

    res.json({ message: 'Social post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSocialPosts,
  getSocialPostById,
  createSocialPost,
  updateSocialPost,
  deleteSocialPost
};
