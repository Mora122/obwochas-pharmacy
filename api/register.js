// Registration API — Create User Account
// Uses MongoDB if MONGODB_URI is set, otherwise falls back to in-memory store

const bcrypt = require('bcryptjs');

let client = null;
let db = null;
let memoryUsers = global['__obwochas_registered_users'] || [];
if (!global['__obwochas_registered_users']) {
  global['__obwochas_registered_users'] = memoryUsers;
}
let memoryIdCounter = 1;

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
        db = client.db('obwochas_pharmacy');
        // Ensure unique email index
        try {
          await db.collection('users').createIndex({ email: 1 }, { unique: true });
        } catch (e) {
          // Index may already exist
        }
      }
      return { mode: 'mongodb', db };
    } catch (e) {
      console.warn('MongoDB connection failed, using memory store:', e.message);
      return { mode: 'memory', db: null };
    }
  }
  return { mode: 'memory', db: null };
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const conn = await connect();

    if (conn.mode === 'mongodb') {
      // Check if email already exists
      const existing = await conn.db.collection('users').findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        status: 'active'
      };

      const result = await conn.db.collection('users').insertOne(user);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! You can now sign in.',
        userId: result.insertedId.toString()
      });
    }

    // In-memory fallback
    const emailLower = email.toLowerCase().trim();
    if (memoryUsers.find(u => u.email === emailLower)) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      id: `USR-${String(memoryIdCounter++).padStart(5, '0')}`,
      name: name.trim(),
      email: emailLower,
      phone: phone.trim(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: false,
      status: 'active'
    };
    memoryUsers.push(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now sign in.',
      userId: user.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Handle duplicate key error (race condition)
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
};
