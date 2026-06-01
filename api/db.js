// Order Database Layer — MongoDB + In-Memory Fallback
// Uses MongoDB if MONGODB_URI is set, otherwise falls back to in-memory store

let client = null;
let db = null;
let memoryStore = [];
let memoryIdCounter = 1;

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
        db = client.db('obwochas_pharmacy');
        await db.collection('orders').createIndex({ createdAt: -1 });
        await db.collection('orders').createIndex({ status: 1 });
      }
      return { mode: 'mongodb', db };
    } catch (e) {
      console.warn('MongoDB connection failed, using memory store:', e.message);
      return { mode: 'memory', db: null };
    }
  }
  return { mode: 'memory', db: null };
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

async function createOrder(orderData) {
  const conn = await connect();
  
  if (conn.mode === 'mongodb') {
    const order = {
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const result = await conn.db.collection('orders').insertOne(order);
    return { ...order, _id: result.insertedId.toString() };
  }
  
  // Memory mode
  const order = {
    ...orderData,
    id: `ORD-${String(memoryIdCounter++).padStart(5, '0')}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  memoryStore.push(order);
  return order;
}

async function getOrders(filter = {}) {
  const conn = await connect();
  if (conn.mode === 'mongodb') {
    const query = {};
    if (filter.status) query.status = filter.status;
    const opts = { sort: { createdAt: -1 } };
    if (filter.limit) opts.limit = filter.limit;
    return await conn.db.collection('orders').find(query, opts).toArray();
  }

  let result = [...memoryStore];
  if (filter.status) result = result.filter(o => o.status === filter.status);
  if (filter.limit) result = result.slice(0, filter.limit);
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getOrder(orderId) {
  const conn = await connect();
  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      return await conn.db.collection('orders').findOne({
        $or: [{ id: orderId }, { _id: new ObjectId(orderId) }]
      });
    } catch {
      return await conn.db.collection('orders').findOne({ id: orderId });
    }
  }
  return memoryStore.find(o => o.id === orderId || o._id === orderId) || null;
}

async function updateOrderStatus(orderId, newStatus) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  const conn = await connect();
  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      const result = await conn.db.collection('orders').findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: { status: newStatus, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      return result;
    } catch {
      return await conn.db.collection('orders').findOneAndUpdate(
        { id: orderId },
        { $set: { status: newStatus, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
    }
  }

  const idx = memoryStore.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  memoryStore[idx].status = newStatus;
  memoryStore[idx].updatedAt = new Date().toISOString();
  return memoryStore[idx];
}

async function linkPayment(orderId, paymentData) {
  const conn = await connect();
  const update = { payment: paymentData, updatedAt: new Date().toISOString() };
  if (paymentData.status === 'completed') update.status = 'confirmed';

  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      return await conn.db.collection('orders').findOneAndUpdate(
        { _id: new ObjectId(orderId) },
        { $set: update },
        { returnDocument: 'after' }
      );
    } catch {
      return await conn.db.collection('orders').findOneAndUpdate(
        { id: orderId },
        { $set: update },
        { returnDocument: 'after' }
      );
    }
  }

  const idx = memoryStore.findIndex(o => o.id === orderId);
  if (idx === -1) return null;
  memoryStore[idx].payment = paymentData;
  memoryStore[idx].status = update.status;
  memoryStore[idx].updatedAt = update.updatedAt;
  return memoryStore[idx];
}

module.exports = { connect, createOrder, getOrders, getOrder, updateOrderStatus, linkPayment };
