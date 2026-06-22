// Analytics API — Dashboard stats for admin
// GET /api/analytics — Returns revenue, order stats, product counts, user counts
const { connect } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const conn = await connect();

    let stats = {
      totalOrders: 0,
      totalRevenue: 0,
      totalProducts: 0,
      totalUsers: 0,
      pendingOrders: 0,
      shippedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      lowStockProducts: 0,
      pendingReviews: 0,
      recentOrders: [],
      revenueByDay: [],
      topProducts: [],
      ordersByStatus: {}
    };

    if (conn.mode === 'mongodb') {
      const db = conn.db;

      // Order stats
      const orders = await db.collection('orders').find({}).toArray();
      stats.totalOrders = orders.length;
      stats.totalRevenue = orders.reduce((sum, o) => {
        const total = parseFloat(o.total) || parseFloat(o.subtotal || 0) + parseFloat(o.delivery || 0);
        return sum + (o.status === 'cancelled' ? 0 : total);
      }, 0);

      // Orders by status
      const statusCounts = {};
      for (const o of orders) {
        const s = o.status || 'pending';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      }
      stats.ordersByStatus = statusCounts;
      stats.pendingOrders = statusCounts['pending'] || 0;
      stats.shippedOrders = statusCounts['shipped'] || 0;
      stats.deliveredOrders = statusCounts['delivered'] || 0;
      stats.cancelledOrders = statusCounts['cancelled'] || 0;

      // Recent orders
      stats.recentOrders = orders
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5)
        .map(o => ({
          id: o._id.toString(),
          name: o.name || o.customerName || 'Unknown',
          total: o.total || o.subtotal || 0,
          status: o.status || 'pending',
          createdAt: o.createdAt || o.orderDate
        }));

      // Top products by order quantity
      const productCounts = {};
      for (const o of orders) {
        const items = o.items || o.products || o.cart || [];
        for (const item of items) {
          const name = item.name || item.productName || 'Unknown';
          const qty = parseInt(item.quantity || item.qty || 1);
          productCounts[name] = (productCounts[name] || 0) + qty;
        }
      }
      stats.topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

      // Product count
      const products = await db.collection('products').find({}).toArray();
      stats.totalProducts = products.length;
      stats.lowStockProducts = products.filter(p => (p.stock || 0) < 20).length;

      // User count
      const users = await db.collection('users').countDocuments({});
      stats.totalUsers = users;

      // Revenue by day (last 30 days)
      const dayMap = {};
      const today = new Date();
      for (let i = 30; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = 0;
      }
      for (const o of orders) {
        if (o.status === 'cancelled') continue;
        const date = (o.createdAt || '').slice(0, 10);
        if (date && dayMap[date] !== undefined) {
          dayMap[date] += parseFloat(o.total || o.subtotal || 0);
        }
      }
      stats.revenueByDay = Object.entries(dayMap).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }));

      // Pending reviews count
      try {
        const pendingReviews = await db.collection('reviews').countDocuments({ approved: { $ne: true } });
        stats.pendingReviews = pendingReviews;
      } catch (e) { /* reviews collection may not exist */ }

    } else {
      // Memory mode — basic stats
      stats.totalProducts = 23;
      stats.totalUsers = 0;
      stats.totalOrders = 0;
      stats.totalRevenue = 0;
    }

    return res.json({ success: true, stats });

  } catch (e) {
    console.error('Analytics error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};
