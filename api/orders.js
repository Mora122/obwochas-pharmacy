// POST /api/orders → create order
// GET  /api/orders → list orders (optional ?status= filter)
const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    if (req.method === 'POST') {
      // CREATE ORDER
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

      return res.status(201).json({
        success: true,
        order: {
          id: order.id || order._id?.toString(),
          status: order.status,
          totals: order.totals,
          customer: order.customer,
          items: order.items,
          createdAt: order.createdAt
        }
      });
    }

    if (req.method === 'GET') {
      // LIST ORDERS
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

    res.status(405).json({ error: 'Method not allowed' });

  } catch (err) {
    console.error('Orders error:', err);
    res.status(500).json({ error: err.message });
  }
};
