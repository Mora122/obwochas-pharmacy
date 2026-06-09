// GET  /api/order?id=xxx — Get single order details
// PATCH /api/order?id=xxx — Update order status (admin)
const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const orderId = req.query?.id || req.body?.id;

    if (!orderId) {
      return res.status(400).json({ error: 'Missing order id (use ?id=ORD-xxx)' });
    }

    if (req.method === 'GET') {
      const order = await db.getOrder(orderId);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      return res.json({ success: true, order });
    }

    if (req.method === 'PATCH') {
      const { status, discount } = req.body;
      
      if (discount) {
        if (!discount.type || !discount.value) {
          return res.status(400).json({ error: 'Discount needs type (percentage/fixed) and value' });
        }
        if (!['percentage', 'fixed'].includes(discount.type)) {
          return res.status(400).json({ error: 'Discount type must be percentage or fixed' });
        }
        if (discount.value <= 0) {
          return res.status(400).json({ error: 'Discount value must be positive' });
        }
        const updated = await db.applyDiscount(orderId, discount);
        if (!updated) return res.status(404).json({ error: 'Order not found' });
        return res.json({ success: true, order: updated });
      }
      
      if (!status) return res.status(400).json({ error: 'Missing status or discount field' });
      
      const updated = await db.updateOrderStatus(orderId, status);
      if (!updated) return res.status(404).json({ error: 'Order not found' });
      return res.json({ success: true, order: updated });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Order error:', err);
    res.status(500).json({ error: err.message });
  }
};
