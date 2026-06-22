// Seed Admin API — Creates admin user if it doesn't exist
// POST /api/seed-admin — Call once to set up admin account
const bcrypt = require('bcryptjs');
const { connect } = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const adminEmail = 'admin@obwochaspharmacy.co.ke';
    const adminPassword = 'Admin@2026!'; // <-- CHANGE THIS after first login

    const conn = await connect();
    let existing = null;

    if (conn.mode === 'mongodb') {
      existing = await conn.db.collection('users').findOne({ email: adminEmail });
    } else {
      // Check memory store (from login.js)
      if (global['__obwochas_registered_users']) {
        existing = global['__obwochas_registered_users'].find(u => u.email === adminEmail);
      }
    }

    if (existing) {
      return res.json({
        success: true,
        message: 'Admin account already exists. Sign in at /admin.html',
        email: adminEmail
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = {
      name: 'Admin',
      email: adminEmail,
      phone: '0727747699',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      status: 'active'
    };

    if (conn.mode === 'mongodb') {
      await conn.db.collection('users').insertOne(adminUser);
    } else {
      if (!global['__obwochas_registered_users']) {
        global['__obwochas_registered_users'] = [];
      }
      adminUser.id = 'ADM-001';
      global['__obwochas_registered_users'].push(adminUser);
    }

    return res.json({
      success: true,
      message: 'Admin account created!',
      email: adminEmail,
      password: adminPassword,
      loginUrl: '/admin.html'
    });

  } catch (e) {
    console.error('Seed admin error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};
