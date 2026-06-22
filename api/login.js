// Login API — Authenticate User, return JWT token
const bcrypt = require('bcryptjs');
const { generateToken } = require('../lib/auth');

let client = null;
let db = null;
let memoryUsers = [];

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
        db = client.db('obwochas_pharmacy');
      }
      return { mode: 'mongodb', db };
    } catch (e) {
      console.warn('MongoDB connection failed, using memory store:', e.message);
      return { mode: 'memory', db: null };
    }
  }
  return { mode: 'memory', db: null };
}

// Load registered users from memory (shared via global for same-instance persistence)
const MEMORY_KEY = '***';
if (!global[MEMORY_KEY]) global[MEMORY_KEY] = [];
const getMemoryUsers = () => global[MEMORY_KEY];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Seed admin endpoint (GET /api/login?seed=1)
  if (req.method === 'GET' && req.query?.seed === '1') {
    try {
      const conn = await connect();
      const adminEmail = 'admin@obwochaspharmacy.co.ke';
      const adminPassword = 'Admin@2026!';

      let existing = null;
      if (conn.mode === 'mongodb') {
        existing = await conn.db.collection('users').findOne({ email: adminEmail });
      } else {
        const regUsers = global['__obwochas_registered_users'];
        if (regUsers) existing = regUsers.find(function(u){return u.email===adminEmail});
      }

      if (existing) {
        return res.json({ success: true, message: 'Admin account already exists', email: adminEmail, loginUrl: '/admin.html' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      const adminUser = { name: 'Admin', email: adminEmail, phone: '0727747699', password: hashedPassword, role: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), emailVerified: true, status: 'active' };

      if (conn.mode === 'mongodb') {
        await conn.db.collection('users').insertOne(adminUser);
      } else {
        if (!global['__obwochas_registered_users']) global['__obwochas_registered_users'] = [];
        adminUser.id = 'ADM-001';
        global['__obwochas_registered_users'].push(adminUser);
      }

      return res.json({ success: true, message: 'Admin account created!', email: adminEmail, password: adminPassword, loginUrl: '/admin.html' });
    } catch (e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const conn = await connect();
    let user;

    if (conn.mode === 'mongodb') {
      user = await conn.db.collection('users').findOne({ email: email.toLowerCase().trim() });
    } else {
      const users = getMemoryUsers();
      user = users.find(u => u.email === email.toLowerCase().trim());
      if (!user) {
        const regUsers = global['__obwochas_registered_users'];
        if (regUsers) {
          user = regUsers.find(u => u.email === email.toLowerCase().trim());
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Success — return user info + token
    return res.status(200).json({
      success: true,
      message: 'Sign in successful!',
      token,
      user: {
        id: user._id?.toString() || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};
