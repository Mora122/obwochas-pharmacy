// Public order tracking endpoint — no auth required
// GET /api/track?id=ORD-xxxxx
const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { return res.status(405).json({ error: 'Method not allowed' }); }

  try {
    const orderId = (req.query?.id || '').trim();
    if (!orderId) {
      return res.status(400).json({ error: 'Missing order ID (use ?id=ORD-xxxxx)' });
    }

    const order = await db.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return sanitized tracking info (no sensitive data like payment details)
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
  } catch (err) {
    console.error('Track error:', err);
    res.status(500).json({ error: 'Server error. Try again.' });
  }
};
