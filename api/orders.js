// Orders + Tracking + Notifications API
// GET  /api/orders          — list orders (admin)
// GET  /api/orders?track=ID — public order tracking (no auth)
// POST /api/orders          — create order (public) + auto-notify
// GET  /api/orders?notifications=1   — list notifications (admin)
// PATCH /api/orders          — mark notification read / mark all read (admin)
const db = require('../lib/db');
const notif = require('../lib/notifications_db');
const email = require('../lib/email');
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

      // PUBLIC: Get orders by user email (for customer order history)
      if (req.query?.email) {
        const email = req.query.email.trim().toLowerCase();
        if (!email) return res.status(400).json({ error: 'Missing email parameter' });

        const orders = await db.getOrders({ customerEmail: email, limit: 50 });
        return res.json({
          success: true,
          count: orders.length,
          orders: orders.map(o => ({
            id: o.id || o._id?.toString(),
            status: o.status,
            total: o.totals?.total,
            items: o.items?.length || 0,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt
          }))
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

      // ADMIN: Dashboard analytics
      if (req.query?.analytics === '1') {
        const user = requireAdmin(req, res);
        if (!user) return;

        const conn = await db.connect();
        var stats = { totalOrders: 0, totalRevenue: 0, totalProducts: 0, totalUsers: 0, pendingOrders: 0, shippedOrders: 0, deliveredOrders: 0, cancelledOrders: 0, lowStockProducts: 0, pendingReviews: 0, recentOrders: [], revenueByDay: [], ordersByDay: [], topProducts: [], ordersByStatus: {} };

        if (conn.mode === 'mongodb') {
          const coll = conn.db.collection('orders');
          const orders = await coll.find({}).toArray();
          stats.totalOrders = orders.length;
          var r30 = new Date(); r30.setDate(r30.getDate() - 30);
          var statusCounts = {};
          for (var o of orders) {
            var t = parseFloat(o.totals?.total || o.total || o.subtotal || 0);
            var s = o.status || 'pending';
            if (s !== 'cancelled') stats.totalRevenue += t;
            statusCounts[s] = (statusCounts[s] || 0) + 1;
          }
          stats.ordersByStatus = statusCounts;
          stats.pendingOrders = statusCounts['pending'] || 0;
          stats.shippedOrders = statusCounts['shipped'] || 0;
          stats.deliveredOrders = statusCounts['delivered'] || 0;
          stats.cancelledOrders = statusCounts['cancelled'] || 0;

          stats.recentOrders = orders.sort(function(a,b){return new Date(b.createdAt||0)-new Date(a.createdAt||0)}).slice(0,5).map(function(o){return{id:o._id?.toString(),name:o.customer?.name||'Unknown',total:parseFloat(o.totals?.total||o.total||0),status:o.status||'pending',createdAt:o.createdAt}});

          // Top products
          var pCounts = {};
          for (var o of orders) {
            var items = o.items || [];
            for (var item of items) {
              var n = item.name || 'Unknown';
              var q = parseInt(item.quantity || item.qty || 1);
              pCounts[n] = (pCounts[n] || 0) + q;
            }
          }
          stats.topProducts = Object.entries(pCounts).sort(function(a,b){return b[1]-a[1]}).slice(0,10).map(function(x){return{name:x[0],count:x[1]}});

          // Products count
          try {
            var prods = await conn.db.collection('products').find({}).toArray();
            stats.totalProducts = prods.length;
            stats.lowStockProducts = prods.filter(function(p){return(p.stock||0)<20}).length;
          } catch(e){}

          // Users count
          try { stats.totalUsers = await conn.db.collection('users').countDocuments({}); } catch(e){}

          // Revenue by day (30 days)
          var dayMap = {};
          var today = new Date();
          var orderCountMap = {};
          for (var i=30;i>=0;i--) { var d=new Date(today);d.setDate(d.getDate()-i);dayMap[d.toISOString().slice(0,10)]=0; orderCountMap[d.toISOString().slice(0,10)]=0; }
          for (var o of orders) {
            if (o.status === 'cancelled') continue;
            var date = (o.createdAt||'').slice(0,10);
            if (date && dayMap[date]!==undefined) dayMap[date] += parseFloat(o.totals?.total||o.total||o.subtotal||0);
          }
          for (var o of orders) {
            var date = (o.createdAt||'').slice(0,10);
            if (date && orderCountMap[date]!==undefined) orderCountMap[date] += 1;
          }
          stats.revenueByDay = Object.entries(dayMap).map(function(x){return{date:x[0],revenue:Math.round(x[1]*100)/100}});
          stats.ordersByDay = Object.entries(orderCountMap).map(function(x){return{date:x[0],orders:x[1]}});

          // Pending reviews
          try { stats.pendingReviews = await conn.db.collection('reviews').countDocuments({approved:{$ne:true}}); } catch(e){}
        }

        return res.json({ success: true, stats });
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

      // Send email confirmation (non-blocking)
      try {
        await email.sendOrderConfirmation(order, customer.email || '');
      } catch (emailErr) {
        console.warn('[EMAIL] Confirmation failed:', emailErr.message);
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
