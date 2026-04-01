const Alert = require('../models/Alert');
const Notification = require('../models/Notification');
const { emitToUser } = require('../socket/socketManager');
const smsService = require('./smsNotificationService');
const callService = require('./callNotificationService');
const User = require('../models/User');

/**
 * After a new post is saved, find all users with matching active alerts
 * and notify them via Socket.IO, SMS, and phone call.
 *
 * @param {Object} post - Mongoose Post document (populated with author)
 */
const match = async (post) => {
  if (!post.produceTags || post.produceTags.length === 0) return;

  // Find all active alerts matching any produce tag, excluding the poster
  const matchingAlerts = await Alert.find({
    produce: { $in: post.produceTags },
    isActive: true,
    user: { $ne: post.author._id || post.author },
  }).populate('user', 'mobile name village');

  if (matchingAlerts.length === 0) return;

  // Get poster info for the notification message
  const poster = await User.findById(post.author._id || post.author).select('name village');
  const posterName = poster?.name || 'Ek kisaan';
  const posterVillage = poster?.village ? ` (${poster.village})` : '';

  // Group alerts by user to send one notification per user
  const userAlertMap = new Map();
  matchingAlerts.forEach((alert) => {
    const uid = alert.user._id.toString();
    if (!userAlertMap.has(uid)) {
      userAlertMap.set(uid, { user: alert.user, matchedProduce: new Set(), alerts: [] });
    }
    userAlertMap.get(uid).matchedProduce.add(alert.produce);
    userAlertMap.get(uid).alerts.push(alert);
  });

  // Notify each unique user
  const notifyPromises = Array.from(userAlertMap.values()).map(async ({ user, matchedProduce }) => {
    const produceList = Array.from(matchedProduce).join(', ');
    const message = `${posterName}${posterVillage} ke paas ${produceList} uplabdh hai`;

    // 1. Save notification to DB
    const notification = await Notification.create({
      recipient: user._id,
      post: post._id,
      triggeredBy: post.author._id || post.author,
      matchedProduce: Array.from(matchedProduce),
      message,
    });

    // 2. Real-time Socket.IO push
    emitToUser(user._id.toString(), 'new_notification', {
      notificationId: notification._id,
      message,
      matchedProduce: Array.from(matchedProduce),
      post: {
        _id: post._id,
        produceTags: post.produceTags,
        rawMessage: post.rawMessage,
      },
      createdAt: notification.createdAt,
    });

    // 3. SMS notification
    const smsMessage = `${message} - VeggieMandi App`;
    await smsService.send(user.mobile, smsMessage);

    // 4. Outbound call notification
    await callService.call(user.mobile, message);
  });

  await Promise.all(notifyPromises);
  console.log(`[AlertMatch] Notified ${userAlertMap.size} users for post ${post._id}`);
};

module.exports = { match };
