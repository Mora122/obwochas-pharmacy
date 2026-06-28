// Auth API — Login, Register, User Management (merged from login.js + register.js + users.js)
// GET  /api/auth?seed=1            — Seed admin account (public)
// GET  /api/auth                   — List users (admin only)
// POST /api/auth                   — Login or Register (public)
const bcrypt = require('bcryptjs');
const { generateToken, requireAdmin } = require('../lib/auth');
const { sendResetEmail } = require('../lib/email');

// Shared connection & memory store
let client = null;
let db = null;
let inMemoryUsers = global['__obwochas_registered_users'] || [];
if (!global['__obwochas_registered_users']) {
  global['__obwochas_registered_users'] = inMemoryUsers;
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
        try { await db.collection('users').createIndex({ email: 1 }, { unique: true }); } catch (e) {}
      }
      return { mode: 'mongodb', db };
    } catch (e) {
      console.warn('MongoDB connection failed, using memory store:', e.message);
      return { mode: 'memory', db: null };
    }
  }
  return { mode: 'memory', db: null };
}

// Helper: strip password from user object
function stripPassword(u) {
  const { password, ...safe } = u;
  return safe;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    // ============== GET ==============
    if (req.method === 'GET') {
      // Seed admin account
      if (req.query?.seed === '1') {
        const conn = await connect();
        const adminEmail = 'admin@obwochaspharmacy.co.ke';
        const adminPassword = 'obwochas2026';

        let existing = null;
        if (conn.mode === 'mongodb') {
          existing = await conn.db.collection('users').findOne({ email: adminEmail });
        } else {
          if (inMemoryUsers) existing = inMemoryUsers.find(function(u){return u.email===adminEmail});
        }

        if (existing) {
          if (req.query?.force === '1' && conn.mode === 'mongodb') {
            await conn.db.collection('users').deleteOne({ email: adminEmail });
            existing = null;
          } else {
            return res.json({ success: true, message: 'Admin account already exists', email: adminEmail, loginUrl: '/admin.html' });
          }
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
          inMemoryUsers = global['__obwochas_registered_users'];
        }

        return res.json({ success: true, message: 'Admin account created!', email: adminEmail, password: adminPassword, loginUrl: '/admin.html' });
      }

      // List users (admin only)
      const user = requireAdmin(req, res);
      if (!user) return;

      const conn = await connect();
      let users;
      if (conn.mode === 'mongodb') {
        users = await conn.db.collection('users').find({}).project({ password: 0 }).toArray();
      } else {
        users = inMemoryUsers.map(function(u){return stripPassword(u)});
      }
      return res.json({ success: true, count: users.length, users });
    }

    // ============== POST ==============
    if (req.method === 'POST') {
      const { action, name, email, phone, password, address } = req.body || {};

      // Auto-seed admin account on every login attempt (ensures it exists)
      try {
        const _conn = await connect();
        const _adminEmail = 'admin@obwochaspharmacy.co.ke';
        const _adminPassword = 'obwochas2026';
        let _existing = null;
        if (_conn.mode === 'mongodb') {
          _existing = await _conn.db.collection('users').findOne({ email: _adminEmail });
        }
        if (!_existing) {
          const _salt = await bcrypt.genSalt(12);
          const _hashedPassword = await bcrypt.hash(_adminPassword, _salt);
          const _adminUser = { name: 'Admin', email: _adminEmail, phone: '0727747699', password: _hashedPassword, role: 'admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), emailVerified: true, status: 'active' };
          if (_conn.mode === 'mongodb') {
            await _conn.db.collection('users').insertOne(_adminUser);
            console.log('[AUTH] Auto-seeded admin account');
          }
        }
      } catch(_e) {
        console.warn('[AUTH] Auto-seed warning:', _e.message);
      }

      // ============== FORGOT PASSWORD ==============
      if (action === 'forgot-password') {
        const fpEmail = (email || '').toLowerCase().trim();
        if (!fpEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fpEmail)) {
          return res.status(400).json({ success: false, message: 'Valid email is required' });
        }

        const conn = await connect();
        let user;
        if (conn.mode === 'mongodb') {
          user = await conn.db.collection('users').findOne({ email: fpEmail });
        } else {
          user = inMemoryUsers.find(u => u.email === fpEmail);
        }

        if (!user) {
          // Don't reveal if email exists — always return success
          return res.json({ success: true, message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        // Store reset token
        if (conn.mode === 'mongodb') {
          await conn.db.collection('users').updateOne(
            { email: fpEmail },
            { $set: { resetToken, resetExpiry } }
          );
        } else {
          const u = inMemoryUsers.find(x => x.email === fpEmail);
          if (u) { u.resetToken = resetToken; u.resetExpiry = resetExpiry; }
        }

        // Send reset email (async — won't block response)
        sendResetEmail(fpEmail, resetToken).catch(function(err) {
          console.warn('[AUTH] Failed to send reset email:', err.message);
        });

        return res.json({
          success: true,
          message: 'If an account with that email exists, a reset link has been sent.',
          // In dev mode, return the link directly
          ...(process.env.VERCEL_ENV === 'development' || !process.env.VERCEL_ENV
            ? { resetUrl: 'https://obwochas-pharmacy.vercel.app/reset-password.html?token=' + resetToken + '&email=' + encodeURIComponent(fpEmail) }
            : {})
        });
      }

      // ============== RESET PASSWORD ==============
      if (action === 'reset-password') {
        const rpToken = req.body.token || '';
        const rpEmail = (req.body.email || '').toLowerCase().trim();
        const rpPassword = req.body.password || '';

        if (!rpToken || !rpEmail) {
          return res.status(400).json({ success: false, message: 'Invalid reset link' });
        }
        if (!rpPassword || rpPassword.length < 8) {
          return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const conn = await connect();
        let user;
        if (conn.mode === 'mongodb') {
          user = await conn.db.collection('users').findOne({ email: rpEmail });
        } else {
          user = inMemoryUsers.find(u => u.email === rpEmail);
        }

        if (!user || !user.resetToken || user.resetToken !== rpToken) {
          return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });
        }

        if (user.resetExpiry && new Date(user.resetExpiry) < new Date()) {
          return res.status(400).json({ success: false, message: 'Reset link has expired. Please request a new one.' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(rpPassword, salt);

        if (conn.mode === 'mongodb') {
          await conn.db.collection('users').updateOne(
            { email: rpEmail },
            { $set: { password: hashedPassword, updatedAt: new Date().toISOString() }, $unset: { resetToken: '', resetExpiry: '' } }
          );
        } else {
          const u = inMemoryUsers.find(x => x.email === rpEmail);
          if (u) { u.password = hashedPassword; delete u.resetToken; delete u.resetExpiry; }
        }

        return res.json({ success: true, message: 'Password reset successful! You can now sign in with your new password.' });
      }

      // Determine if this is login or register
      const isLogin = action === 'login' || (!action && email && password && !name);

      if (isLogin) {
        // === LOGIN ===
        if (!email || !password) {
          return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const conn = await connect();
        let user;

        if (conn.mode === 'mongodb') {
          user = await conn.db.collection('users').findOne({ email: email.toLowerCase().trim() });
        } else {
          user = inMemoryUsers.find(u => u.email === email.toLowerCase().trim());
        }

        if (!user) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Support both bcrypt-hashed and legacy plain text passwords
        let valid = false;
        if (user.password && user.password.startsWith('$2')) {
          valid = await bcrypt.compare(password, user.password);
        } else {
          valid = user.password === password;
        }

        if (!valid) {
          return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user, user.role || 'admin');

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
      } else {
        // === REGISTER ===
        const regName = name || req.body.name;
        const regEmail = email || req.body.email;
        const regPhone = phone || req.body.phone;
        const regPassword = password || req.body.password;

        if (!regName || !regName.trim()) {
          return res.status(400).json({ success: false, message: 'Full name is required' });
        }
        if (!regEmail || !regEmail.trim()) {
          return res.status(400).json({ success: false, message: 'Email address is required' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
          return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
        if (!regPhone || !regPhone.trim()) {
          return res.status(400).json({ success: false, message: 'Phone number is required' });
        }
        if (!regPassword || regPassword.length < 8) {
          return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        }

        const conn = await connect();

        if (conn.mode === 'mongodb') {
          const existing = await conn.db.collection('users').findOne({ email: regEmail.toLowerCase().trim() });
          if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
          }

          const salt = await bcrypt.genSalt(12);
          const hashedPassword = await bcrypt.hash(regPassword, salt);

          const user = {
            name: regName.trim(),
            email: regEmail.toLowerCase().trim(),
            phone: regPhone.trim(),
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
        const emailLower = regEmail.toLowerCase().trim();
        if (inMemoryUsers.find(u => u.email === emailLower)) {
          return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(regPassword, salt);

        const user = {
          id: `USR-${String(memoryIdCounter++).padStart(5, '0')}`,
          name: regName.trim(),
          email: emailLower,
          phone: regPhone.trim(),
          password: hashedPassword,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          emailVerified: false,
          status: 'active'
        };
        inMemoryUsers.push(user);

        return res.status(201).json({
          success: true,
          message: 'Account created successfully! You can now sign in.',
          userId: user.id
        });
      }
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (err) {
    console.error('Auth API error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
