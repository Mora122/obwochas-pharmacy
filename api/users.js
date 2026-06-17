// Users API — Public user registration/login (alternative to register.js / login.js)
// Returns proper JWT tokens compatible with admin endpoints
const bcrypt = require('bcryptjs');
const { generateToken, requireAdmin } = require('../lib/auth');

let client, db;
let inMemoryUsers = [];

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
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

// GET /api/users — admin only: list all registered users
// POST /api/users — public: register or login
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const conn = await connect();

  // GET — admin: list users
  if (req.method === 'GET') {
    const user = requireAdmin(req, res);
    if (!user) return;

    let users;
    if (conn.mode === 'mongodb') {
      users = await conn.db.collection('users').find({}).project({ password: 0 }).toArray();
    } else {
      users = inMemoryUsers.map(u => { const { password, ...safe } = u; return safe; });
    }
    return res.json({ success: true, count: users.length, users });
  }

  // POST — public: register or login
  if (req.method === 'POST') {
    const { action, name, email, phone, password, address } = req.body || {};
    if (!action || !['register', 'login'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be register or login' });
    }

    if (action === 'register') {
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'Name, email, and password required' });
      }

      const user = {
        id: 'USR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: (phone || '').trim(),
        password: await bcrypt.hash(password, 12),
        address: address || '',
        orders: [],
        createdAt: new Date().toISOString(),
        points: 0,
        tier: 'standard'
      };

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

      const token = generateToken(user);
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, token, user: safeUser, message: 'Registration successful!' });
    }

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

      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // Support both bcrypt-hashed passwords and legacy plain text
      let valid = false;
      if (user.password.startsWith('$2')) {
        valid = await bcrypt.compare(password, user.password);
      } else {
        valid = user.password === password;
      }

      if (!valid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      const { password: _, ...safeUser } = user;
      return res.json({ success: true, token, user: safeUser, message: 'Welcome back!' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};
