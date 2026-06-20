// Notification Database Layer — stores notifications for order events
// Uses MongoDB if available, otherwise in-memory

let client = null;
let dbNotify = null;
let memoryNotifications = [];
let notifyIdCounter = 1;

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
        dbNotify = client.db('obwochas_pharmacy');
        await dbNotify.collection('notifications').createIndex({ createdAt: -1 });
        await dbNotify.collection('notifications').createIndex({ read: 1 });
      }
      return { mode: 'mongodb', db: dbNotify };
    } catch (e) {
      console.warn('MongoDB notification connection failed, using memory:', e.message);
      return { mode: 'memory', db: null };
    }
  }
  return { mode: 'memory', db: null };
}

async function createNotification({ type, title, message, orderId, customer }) {
  const conn = await connect();
  const notification = {
    type: type || 'info',        // 'order_created', 'order_updated', 'payment_received', 'info'
    title: title || 'Notification',
    message: message || '',
    orderId: orderId || '',
    customer: customer || '',
    read: false,
    createdAt: new Date().toISOString()
  };

  if (conn.mode === 'mongodb') {
    const result = await conn.db.collection('notifications').insertOne(notification);
    return { ...notification, _id: result.insertedId.toString() };
  }

  notification.id = `NOTIF-${String(notifyIdCounter++).padStart(4, '0')}`;
  memoryNotifications.push(notification);
  return notification;
}

async function getNotifications({ limit = 20, unreadOnly = false } = {}) {
  const conn = await connect();

  if (conn.mode === 'mongodb') {
    const query = {};
    if (unreadOnly) query.read = false;
    return await conn.db.collection('notifications')
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  let results = [...memoryNotifications];
  if (unreadOnly) results = results.filter(n => !n.read);
  return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, limit);
}

async function markAsRead(notificationId) {
  const conn = await connect();

  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      await conn.db.collection('notifications').updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { read: true } }
      );
      return true;
    } catch {
      await conn.db.collection('notifications').updateOne(
        { id: notificationId },
        { $set: { read: true } }
      );
      return true;
    }
  }

  const idx = memoryNotifications.findIndex(n => n.id === notificationId);
  if (idx !== -1) memoryNotifications[idx].read = true;
  return idx !== -1;
}

async function markAllAsRead() {
  const conn = await connect();

  if (conn.mode === 'mongodb') {
    await conn.db.collection('notifications').updateMany(
      { read: false },
      { $set: { read: true } }
    );
    return true;
  }

  memoryNotifications.forEach(n => { n.read = true; });
  return true;
}

async function getUnreadCount() {
  const conn = await connect();

  if (conn.mode === 'mongodb') {
    return await conn.db.collection('notifications').countDocuments({ read: false });
  }

  return memoryNotifications.filter(n => !n.read).length;
}

module.exports = { connect, createNotification, getNotifications, markAsRead, markAllAsRead, getUnreadCount };
