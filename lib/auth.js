// Auth library — JWT token generation and verification
// Uses jsonwebtoken with a secret stored in env or fallback
const jwt = require('jsonwebtoken');

// In production, set JWT_SECRET in Vercel env vars
const JWT_SECRET = process.env.JWT_SECRET || 'obwocha-pharmacy-jwt-secret-2026';

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object from DB (must have _id/id, email)
 * @param {string} [role='admin'] - Role to assign
 * @returns {string} JWT token (24h expiry)
 */
function generateToken(user, role = 'admin') {
  return jwt.sign(
    {
      id: (user._id || user.id).toString(),
      email: user.email,
      role: role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify a JWT token from the Authorization header
 * @param {import('http').IncomingMessage} req - HTTP request
 * @returns {Object|null} Decoded token payload, or null if invalid/missing
 */
function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth || typeof auth !== 'string') return null;
  // Accept "Bearer <token>"
  const parts = auth.split(' ');
  const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : parts[0];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: require admin JWT, return 401 and false if absent
 * @param {import('http').IncomingMessage} req - HTTP request
 * @param {import('http').ServerResponse} res - HTTP response
 * @returns {Object|null} Decoded user or null (response already sent)
 */
function requireAdmin(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized. Please sign in.' });
    return null;
  }
  return user;
}

module.exports = { generateToken, verifyToken, requireAdmin };
