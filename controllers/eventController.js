const Event = require('../models/Event');
const ActivityLog = require('../models/ActivityLog');

const resolveEventCover = (eventData) => {
  if (!eventData) {
    return '';
  }

  const gallery = Array.isArray(eventData.gallery) ? eventData.gallery : [];
  const galleryItem = gallery.find((item) => item && item.url);
  if (galleryItem?.url) {
    return galleryItem.url;
  }

  const images = Array.isArray(eventData.images) ? eventData.images : [];
  const image = images.find(Boolean);
  return image || '';
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { status, type, year } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.eventType = type;
    if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const events = await Event.find(query)
      .sort({ date: -1 })
      .populate('createdBy', 'email');

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      createdBy: req.admin._id
    };

    if (!eventData.coverImage) {
      const fallbackCover = resolveEventCover(eventData);
      if (fallbackCover) {
        eventData.coverImage = fallbackCover;
      }
    }

    const event = await Event.create(eventData);

    // Log activity
    await ActivityLog.create({
      admin: req.admin._id,
      action: 'create',
      module: 'events',
      description: `Created event: ${event.title}`,
      resourceId: event._id,
      resourceType: 'Event'
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create event', error: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const payload = { ...req.body };
    if (!payload.coverImage && !event.coverImage) {
      const fallbackCover = resolveEventCover(payload) || resolveEventCover(event);
      if (fallbackCover) {
        payload.coverImage = fallbackCover;
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );

    // Log activity
    await ActivityLog.create({
      admin: req.admin._id,
      action: 'update',
      module: 'events',
      description: `Updated event: ${updatedEvent.title}`,
      resourceId: updatedEvent._id,
      resourceType: 'Event'
    });

    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update event', error: error.message });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.deleteOne();

    // Log activity
    await ActivityLog.create({
      admin: req.admin._id,
      action: 'delete',
      module: 'events',
      description: `Deleted event: ${event.title}`,
      resourceId: event._id,
      resourceType: 'Event'
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
const getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      status: 'upcoming',
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(5);

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getUpcomingEvents
};
