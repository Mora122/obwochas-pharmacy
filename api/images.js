// Image upload & serve API
// POST /api/upload — accepts base64 image, stores in MongoDB, returns URL
// GET /api/images?id=xxx — serves image
const { connect } = require('../lib/db');
const { requireAdmin } = require('../lib/auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const conn = await connect();
    if (conn.mode !== 'mongodb') {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    const collection = conn.db.collection('images');

    // GET — Serve image (public, no auth needed)
    if (req.method === 'GET') {
      var id = req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Image ID required' });
      }

      var img = await collection.findOne({ _id: id });
      if (!img) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }

      var buf = Buffer.from(img.data, 'base64');
      res.setHeader('Content-Type', img.mime || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(buf);
    }

    // POST — Upload image (admin only)
    if (req.method === 'POST') {
      const user = requireAdmin(req, res);
      if (!user) return;

      const { image } = req.body || {};
      if (!image) {
        return res.status(400).json({ success: false, error: 'Image data required' });
      }

      // Extract mime type and base64 data
      var mime = 'image/jpeg';
      var data = image;
      if (image.indexOf('data:') === 0) {
        var parts = image.split(',');
        mime = parts[0].split(';')[0].split(':')[1] || 'image/jpeg';
        data = parts[1];
      }

      // Generate unique ID
      var id = require('crypto').randomBytes(12).toString('hex');

      // Store in MongoDB
      await collection.insertOne({
        _id: id,
        mime: mime,
        data: data,
        createdAt: new Date()
      });

      var url = '/api/images?id=' + id;
      return res.json({ success: true, url: url });
    }

    // GET — Serve image
    if (req.method === 'GET') {
      var id = req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Image ID required' });
      }

      var img = await collection.findOne({ _id: id });
      if (!img) {
        return res.status(404).json({ success: false, error: 'Image not found' });
      }

      var buf = Buffer.from(img.data, 'base64');
      res.setHeader('Content-Type', img.mime || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.send(buf);
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('Image API error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};
