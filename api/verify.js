// Admin authentication endpoint
// Password comes from Vercel environment variable ADMIN_PASSWORD
// Fallback only for development — set a real password in Vercel dashboard

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json({ success: false, error: 'Server not configured for admin access' });
    return;
  }

  if (!password) {
    res.status(400).json({ success: false, error: 'Password required' });
    return;
  }

  if (password === adminPassword) {
    // Generate a simple session token (timestamp + random)
    const token = Buffer.from(
      JSON.stringify({
        t: Date.now(),
        r: Math.random().toString(36).slice(2),
        u: 'admin'
      })
    ).toString('base64');

    res.json({
      success: true,
      token: token,
      expiresIn: 3600000 // 1 hour
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
}
