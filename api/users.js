// Users API — Register/Login
// Stores user data in MongoDB (with in-memory fallback)

const { MongoClient, ServerApiVersion } = require('mongodb');

let client, db;
let inMemoryUsers = [];

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
      }
      db = client.db('obwochas_pharmacy');
      return { mode: 'mongodb', db };
    } catch (e) {
      console.warn('MongoDB connection failed, using memory store:', e.message);
      return { mode: 'memory' };
    }
  }
  return { mode: 'memory' };
}

function generateId() {
  return 'USR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function generateToken(userId) {
  return Buffer.from(JSON.stringify({
    uid: userId,
    t: Date.now(),
    r: Math.random().toString(36).slice(2, 8)
  })).toString('base64');
}

function sanitizeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { action, name, email, phone, password, address } = req.body || {};

  if (!action || !['register', 'login'].includes(action)) {
    return res.status(400).json({ success: false, error: 'Action must be register or login' });
  }

  const conn = await connect();

  // --- REGISTER ---
  if (action === 'register') {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password required' });
    }

    const user = {
      id: generateId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      password: password,
      address: address || '',
      orders: [],
      createdAt: new Date().toISOString(),
      points: 0,
      tier: 'standard'
    };

    // Check duplicate email
    if (conn.mode === 'mongodb') {
      const existing = await conn.db.collection('users').findOne({ email: user.email });
      if (existing) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists' });
      }
      await conn.db.collection('users').insertOne(user);
    } else {
      if (inMemoryUsers.find(u => u.email === user.email)) {
        return res.status(409).json({ success: false, error: 'An account with this email already exists' });
      }
      inMemoryUsers.push(user);
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: 'Registration successful!'
    });
  }

  // --- LOGIN ---
  if (action === 'login') {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    let user;
    if (conn.mode === 'mongodb') {
      user = await conn.db.collection('users').findOne({ email: email.trim().toLowerCase() });
    } else {
      user = inMemoryUsers.find(u => u.email === email.trim().toLowerCase());
    }

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      token,
      user: sanitizeUser(user),
      message: 'Welcome back!'
    });
  }
}
