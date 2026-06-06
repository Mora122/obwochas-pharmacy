// Login API — Authenticate User
const bcrypt = require('bcryptjs');

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
const MEMORY_KEY = '__obwochas_users';
if (!global[MEMORY_KEY]) global[MEMORY_KEY] = [];
const getMemoryUsers = () => global[MEMORY_KEY];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
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
      // Also check register.js memory — we maintain a global reference
      user = users.find(u => u.email === email.toLowerCase().trim());
      if (!user) {
        // Try to find in register.js memory via a global hook
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

    // Success — return user info (never send password back)
    return res.status(200).json({
      success: true,
      message: 'Sign in successful!',
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
