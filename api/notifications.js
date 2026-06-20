// Notifications API
// GET  /api/notifications — list notifications (admin, paginated)
// POST /api/notifications — create a notification (internal)
// PATCH /api/notifications — mark as read
const notificationsDb = require('../lib/notifications_db');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // POST — create a notification (admin only — or internal)
    if (req.method === 'POST') {
      const { type, title, message, orderId, customer } = req.body;
      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message required' });
      }
      const notif = await notificationsDb.createNotification({ type, title, message, orderId, customer });
      return res.status(201).json({ success: true, notification: notif });
    }

    // GET — list notifications (admin only)
    if (req.method === 'GET') {
      const user = requireAdmin(req, res);
      if (!user) return;

      const limit = parseInt(req.query?.limit) || 50;
      const unreadOnly = req.query?.unread === 'true';
      const notifications = await notificationsDb.getNotifications({ limit, unreadOnly });
      const unreadCount = await notificationsDb.getUnreadCount();

      return res.json({
        success: true,
        count: notifications.length,
        unreadCount,
        notifications: notifications.map(n => ({
          id: n._id?.toString() || n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          orderId: n.orderId,
          customer: n.customer,
          read: n.read,
          createdAt: n.createdAt
        }))
      });
    }

    // PATCH — mark notification(s) as read (admin only)
    if (req.method === 'PATCH') {
      const user = requireAdmin(req, res);
      if (!user) return;

      const { id, markAll } = req.body;

      if (markAll) {
        await notificationsDb.markAllAsRead();
        return res.json({ success: true, message: 'All notifications marked as read' });
      }

      if (id) {
        await notificationsDb.markAsRead(id);
        return res.json({ success: true, message: 'Notification marked as read' });
      }

      return res.status(400).json({ error: 'Provide id or markAll: true' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Notification error:', err);
    res.status(500).json({ error: err.message });
  }
};
