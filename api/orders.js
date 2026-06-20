// GET  /api/orders — list orders (admin only, requires JWT)
// POST /api/orders — create order (public)
const db = require('../lib/db');
const notif = require('../lib/notifications_db');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // GET — list orders (ADMIN ONLY)
    if (req.method === 'GET') {
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

    // POST — create order (PUBLIC — no auth needed)
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

      // Auto-create notification
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
        },
        notification: 'Order confirmation sent'
      });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Orders error:', err);
    res.status(500).json({ error: err.message });
  }
};
