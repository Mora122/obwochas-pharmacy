// Orders + Tracking + Notifications API
// GET  /api/orders          — list orders (admin)
// GET  /api/orders?track=ID — public order tracking (no auth)
// POST /api/orders          — create order (public) + auto-notify
// GET  /api/orders?notifications=1   — list notifications (admin)
// PATCH /api/orders          — mark notification read / mark all read (admin)
const db = require('../lib/db');
const notif = require('../lib/notifications_db');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // ============== GET ==============
    if (req.method === 'GET') {
      // PUBLIC: Track order by ID
      if (req.query?.track) {
        const orderId = req.query.track.trim();
        if (!orderId) return res.status(400).json({ error: 'Missing order ID' });

        const order = await db.getOrder(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        return res.json({
          success: true,
          order: {
            id: order.id || order._id?.toString(),
            status: order.status || 'pending',
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            customer: {
              name: order.customer?.name || 'Guest',
              phone: order.customer?.phone || ''
            },
            items: (order.items || []).map(item => ({
              name: item.name || 'Product',
              quantity: item.quantity || item.qty || 1,
              price: item.price || 0
            })),
            totals: order.totals || {},
            payment: {
              method: order.payment?.method || 'Pending',
              status: order.payment?.status || 'pending'
            }
          }
        });
      }

      // PUBLIC: List notifications
      if (req.query?.notifications) {
        const user = requireAdmin(req, res);
        if (!user) return;

        const limit = parseInt(req.query?.limit) || 50;
        const unreadOnly = req.query?.unread === 'true';
        const notifications = await notif.getNotifications({ limit, unreadOnly });
        const unreadCount = await notif.getUnreadCount();

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

      // ADMIN: List orders
      const user = requireAdmin(req, res);
      if (!user) return;

      const status = req.query?.status;
      const limit = parseInt(req.query?.limit) || 50;
      const userFilter = req.query?.user;
      const orders = await db.getOrders({ status, limit, userId: userFilter });
      return res.json({
        success: true,
        count: orders.length,
        orders: orders.map(o => ({
          id: o.id || o._id?.toString(),
          status: o.status,
          customer: o.customer,
          items: o.items?.length || 0,
          total: o.totals?.total,
          payment: o.payment,
          createdAt: o.createdAt
        }))
      });
    }

    // ============== POST ==============
    // Create order (PUBLIC — no auth)
    if (req.method === 'POST') {
      const { customer, items, totals, payment, notes } = req.body;

      if (!customer || !items || !items.length) {
        return res.status(400).json({ error: 'Missing required fields: customer, items' });
      }

      const order = await db.createOrder({
        customer: {
          name: customer.name || 'Guest',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || ''
        },
        items: items.map(item => ({
          productId: item.id || item.productId,
          name: item.name,
          quantity: item.quantity || item.qty || 1,
          price: item.price || 0,
          image: item.image || ''
        })),
        totals: {
          subtotal: totals?.subtotal || 0,
          shipping: totals?.shipping || 0,
          tax: totals?.tax || 0,
          total: totals?.total || 0
        },
        payment: payment || { method: 'pending', status: 'pending' },
        notes: notes || ''
      });

      const orderId = order.id || order._id?.toString();

      // Auto-create notification on new order
      try {
        await notif.createNotification({
          type: 'order_created',
          title: 'New Order Received',
          message: (customer.name || 'A customer') + ' placed an order of KSh ' + Number(totals?.total || 0).toLocaleString(),
          orderId: orderId,
          customer: customer.name || 'Guest'
        });
      } catch (notifErr) {
        console.warn('Failed to create notification:', notifErr.message);
      }

      return res.status(201).json({
        success: true,
        order: {
          id: orderId,
          status: order.status,
          totals: order.totals,
          customer: order.customer,
          items: order.items,
          createdAt: order.createdAt
        }
      });
    }

    // ============== PATCH ==============
    // Mark notification read (ADMIN)
    if (req.method === 'PATCH') {
      const user = requireAdmin(req, res);
      if (!user) return;

      const { id, markAll } = req.body;
      if (markAll) {
        await notif.markAllAsRead();
        return res.json({ success: true, message: 'All notifications marked as read' });
      }
      if (id) {
        await notif.markAsRead(id);
        return res.json({ success: true, message: 'Notification marked as read' });
      }
      return res.status(400).json({ error: 'Provide id or markAll: true' });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: err.message });
  }
};
