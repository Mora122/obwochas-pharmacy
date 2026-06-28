// Single order API — detail view + status updates
// Backward-compat proxy for admin calls to /api/order?id=xxx

const { requireAdmin } = require('../lib/auth');
const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const user = requireAdmin(req, res);
    if (!user) return;

    if (req.method === 'GET') {
      const id = req.query?.id;
      if (!id) return res.status(400).json({ success: false, error: 'Missing order ID' });
      const order = await db.getOrder(id);
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
      return res.json({ success: true, order });
    }

    if (req.method === 'PATCH') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ success: false, error: 'Missing order ID' });
      const body = req.body || {};
      const update = { updatedAt: new Date().toISOString() };

      if (body.status) {
        update.status = body.status;
        const updated = await db.updateOrderStatus(id, body.status);
        if (!updated) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.json({ success: true, message: 'Status updated', order: updated });
      }

      if (body.discount !== undefined) {
        const { type, value } = body.discount;
        if (!type || value === undefined) return res.status(400).json({ error: 'Discount needs type and value' });
        if (!['percentage', 'fixed'].includes(type)) return res.status(400).json({ error: 'Invalid discount type' });
        if (value <= 0) return res.status(400).json({ error: 'Discount value must be positive' });
        const updated = await db.applyDiscount(id, type, value);
        if (!updated) return res.status(404).json({ error: 'Order not found' });
        return res.json({ success: true, message: 'Discount applied', order: updated });
      }

      // Phone/address updates
      if (body.phone) update['customer.phone'] = body.phone;
      if (body.address) update['customer.address'] = body.address;

      return res.json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};
