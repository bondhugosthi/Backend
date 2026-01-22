const Contact = require('../models/Contact');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private
const getContacts = async (req, res) => {
  try {
    const { status, category } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .populate('reply.repliedBy', 'email');

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate('reply.repliedBy', 'email');

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    // Mark as read if status is new
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create contact message
// @route   POST /api/contact
// @access  Public
const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({
      message: 'Your message has been sent successfully. We will get back to you soon.',
      contact
    });
  } catch (error) {
    res.status(400).json({ message: 'Failed to send message', error: error.message });
  }
};

// @desc    Reply to contact message
// @route   PUT /api/contact/:id/reply
// @access  Private
const replyContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    contact.reply = {
      message: req.body.message,
      repliedAt: new Date(),
      repliedBy: req.admin._id
    };
    contact.status = 'replied';

    await contact.save();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'contact',
      description: `Replied to contact message from: ${contact.name}`,
      resourceId: contact._id
    });

    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Failed to reply', error: error.message });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
// @access  Private
const updateContactStatus = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update status', error: error.message });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    await contact.deleteOne();

    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'contact',
      description: `Deleted contact message from: ${contact.name}`,
      resourceId: contact._id
    });

    res.json({ message: 'Contact message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get contact statistics
// @route   GET /api/contact/stats
// @access  Private
const getContactStats = async (req, res) => {
  try {
    const total = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const replied = await Contact.countDocuments({ status: 'replied' });
    const archived = await Contact.countDocuments({ status: 'archived' });

    const categoryStats = await Contact.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      newMessages,
      replied,
      archived,
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  replyContact,
  updateContactStatus,
  deleteContact,
  getContactStats
};