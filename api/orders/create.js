// POST /api/orders/create — Create a new order from checkout
const db = require('./db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { customer, items, totals, payment } = req.body;

    // Validate
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
        quantity: item.quantity || 1,
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
      notes: req.body.notes || ''
    });

    res.status(201).json({
      success: true,
      order: {
        id: order.id || order._id,
        status: order.status,
        totals: order.totals,
        customer: order.customer,
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: err.message });
  }
};
