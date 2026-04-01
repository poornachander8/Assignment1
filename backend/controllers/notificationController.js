const Notification = require('../models/Notification');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 30);
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('triggeredBy', 'name village')
      .populate('post', 'rawMessage produceTags');

    const total = await Notification.countDocuments({ recipient: req.user._id });

    res.json({
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/mark-read
const markRead = async (req, res, next) => {
  try {
    const { ids } = req.body;
    const filter = ids && ids.length > 0
      ? { recipient: req.user._id, _id: { $in: ids } }
      : { recipient: req.user._id };

    await Notification.updateMany(filter, { isRead: true });
    res.json({ message: 'Notifications padhi gayi' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, getUnreadCount, markRead };
