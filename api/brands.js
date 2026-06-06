// Brands API — CRUD for Product Brands
// GET  /api/brands       — returns all brands
// POST /api/brands       — add a brand (admin only, needs adminEmail + adminPassword in body)
// DELETE /api/brands     — remove a brand (admin only, needs adminEmail + adminPassword + brandId in body)

const bcrypt = require('bcryptjs');

// Admin email — the account that gets admin powers
const ADMIN_EMAIL = 'admin@obwochaspharmacy.co.ke';

let client = null;
let db = null;
let memoryBrands = [
  { id: 'BR-001', name: 'Wellman', icon: '💊', slug: 'wellman', createdAt: new Date().toISOString() },
  { id: 'BR-002', name: 'Wellwoman', icon: '💊', slug: 'wellwoman', createdAt: new Date().toISOString() },
  { id: 'BR-003', name: 'CeraVe', icon: '🧴', slug: 'cerave', createdAt: new Date().toISOString() },
  { id: 'BR-004', name: 'La Roche-Posay', icon: '🧴', slug: 'laroche', createdAt: new Date().toISOString() },
  { id: 'BR-005', name: 'Eucerin', icon: '🧴', slug: 'eucerin', createdAt: new Date().toISOString() },
  { id: 'BR-006', name: 'Nivea', icon: '🧴', slug: 'nivea', createdAt: new Date().toISOString() },
  { id: 'BR-007', name: 'Dettol', icon: '🩹', slug: 'dettol', createdAt: new Date().toISOString() },
  { id: 'BR-008', name: 'Pampers', icon: '🤱', slug: 'pampers', createdAt: new Date().toISOString() },
  { id: 'BR-009', name: 'Colgate', icon: '🦷', slug: 'colgate', createdAt: new Date().toISOString() },
  { id: 'BR-010', name: 'Seven Seas', icon: '❤️', slug: 'sevenseas', createdAt: new Date().toISOString() },
  { id: 'BR-011', name: 'Optrex', icon: '👁️', slug: 'optrex', createdAt: new Date().toISOString() },
  { id: 'BR-012', name: 'Piriton', icon: '🤧', slug: 'piriton', createdAt: new Date().toISOString() },
  { id: 'BR-013', name: 'Brufen', icon: '⚡', slug: 'brufen', createdAt: new Date().toISOString() },
  { id: 'BR-014', name: 'Sante', icon: '🌿', slug: 'sante', createdAt: new Date().toISOString() },
  { id: 'BR-015', name: 'Opti-Nutrition', icon: '💪', slug: 'opti', createdAt: new Date().toISOString() },
  { id: 'BR-016', name: 'Clarins', icon: '💄', slug: 'clarins', createdAt: new Date().toISOString() },
  { id: 'BR-017', name: "L'Oréal", icon: '💄', slug: 'loreal', createdAt: new Date().toISOString() },
  { id: 'BR-018', name: 'Bioderma', icon: '🧴', slug: 'bioderma', createdAt: new Date().toISOString() },
  { id: 'BR-019', name: 'A-Derma', icon: '🧴', slug: 'a-derma', createdAt: new Date().toISOString() },
  { id: 'BR-020', name: 'Avène', icon: '🧴', slug: 'avene', createdAt: new Date().toISOString() },
  { id: 'BR-021', name: 'Centrum', icon: '💊', slug: 'centrum', createdAt: new Date().toISOString() },
  { id: 'BR-022', name: 'Vitafusion', icon: '💊', slug: 'vitafusion', createdAt: new Date().toISOString() },
  { id: 'BR-023', name: 'Calpol', icon: '🤱', slug: 'calpol', createdAt: new Date().toISOString() },
  { id: 'BR-024', name: "Johnson's", icon: '🤱', slug: 'johnsons', createdAt: new Date().toISOString() },
  { id: 'BR-025', name: 'GSK', icon: '💊', slug: 'gsk', createdAt: new Date().toISOString() },
  { id: 'BR-026', name: 'Bayer', icon: '💊', slug: 'bayer', createdAt: new Date().toISOString() }
];
let memoryIdCounter = 27;

function makeSlug(name) {
  return name.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
        db = client.db('obwochas_pharmacy');
        // Seed brands if collection is empty
        const count = await db.collection('brands').countDocuments();
        if (count === 0) {
          await db.collection('brands').insertMany(memoryBrands);
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

async function verifyAdmin(adminEmail, adminPassword) {
  // Check against MongoDB users collection
  const conn = await connect();
  if (conn.mode === 'mongodb') {
    try {
      const user = await conn.db.collection('users').findOne({ email: adminEmail.toLowerCase().trim() });
      if (!user) return false;
      // Check if this email is admin
      if (user.email !== ADMIN_EMAIL) return false;
      return await bcrypt.compare(adminPassword, user.password);
    } catch {
      return false;
    }
  }

  // In-memory check
  const allUsers = [...(global['__obwochas_users'] || []), ...(global['__obwochas_registered_users'] || [])];
  const user = allUsers.find(u => u.email === adminEmail.toLowerCase().trim());
  if (!user || user.email !== ADMIN_EMAIL) return false;
  try {
    return await bcrypt.compare(adminPassword, user.password);
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const conn = await connect();

    // GET — Return all brands
    if (req.method === 'GET') {
      let brands;
      if (conn.mode === 'mongodb') {
        brands = await conn.db.collection('brands').find({}).sort({ name: 1 }).toArray();
        brands = brands.map(b => ({ id: b._id.toString(), name: b.name, icon: b.icon, slug: b.slug }));
      } else {
        brands = [...memoryBrands].sort((a, b) => a.name.localeCompare(b.name));
      }
      return res.status(200).json({ success: true, brands });
    }

    // POST — Add a brand (admin only)
    if (req.method === 'POST') {
      const { adminEmail, adminPassword, name, icon } = req.body;

      if (!adminEmail || !adminPassword) {
        return res.status(401).json({ success: false, message: 'Admin credentials required' });
      }
      const isAdmin = await verifyAdmin(adminEmail, adminPassword);
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Unauthorized. Only the admin can add brands.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Brand name is required' });
      }

      const brandName = name.trim();
      const slug = makeSlug(brandName);
      const brandIcon = icon || '🏷️';
      const now = new Date().toISOString();

      if (conn.mode === 'mongodb') {
        // Check if brand already exists
        const existing = await conn.db.collection('brands').findOne({ slug });
        if (existing) {
          return res.status(409).json({ success: false, message: `Brand "${brandName}" already exists` });
        }
        const result = await conn.db.collection('brands').insertOne({
          name: brandName, icon: brandIcon, slug, createdAt: now
        });
        return res.status(201).json({
          success: true, message: `Brand "${brandName}" added!`,
          brand: { id: result.insertedId.toString(), name: brandName, icon: brandIcon, slug }
        });
      }

      // Memory mode
      if (memoryBrands.find(b => b.slug === slug)) {
        return res.status(409).json({ success: false, message: `Brand "${brandName}" already exists` });
      }
      const newBrand = {
        id: `BR-${String(memoryIdCounter++).padStart(3, '0')}`,
        name: brandName, icon: brandIcon, slug, createdAt: now
      };
      memoryBrands.push(newBrand);
      return res.status(201).json({
        success: true, message: `Brand "${brandName}" added!`,
        brand: newBrand
      });
    }

    // DELETE — Remove a brand (admin only)
    if (req.method === 'DELETE') {
      const { adminEmail, adminPassword, brandId, brandSlug } = req.body;

      if (!adminEmail || !adminPassword) {
        return res.status(401).json({ success: false, message: 'Admin credentials required' });
      }
      const isAdmin = await verifyAdmin(adminEmail, adminPassword);
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: 'Unauthorized. Only the admin can remove brands.' });
      }
      if (!brandId && !brandSlug) {
        return res.status(400).json({ success: false, message: 'brandId or brandSlug is required' });
      }

      if (conn.mode === 'mongodb') {
        const { ObjectId } = require('mongodb');
        let query = {};
        if (brandId) {
          try { query._id = new ObjectId(brandId); } catch { query._id = brandId; }
        } else {
          query.slug = brandSlug;
        }
        const result = await conn.db.collection('brands').deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        return res.json({ success: true, message: 'Brand removed successfully' });
      }

      // Memory mode
      const idx = brandId
        ? memoryBrands.findIndex(b => b.id === brandId)
        : memoryBrands.findIndex(b => b.slug === brandSlug);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Brand not found' });
      }
      const removed = memoryBrands.splice(idx, 1)[0];
      return res.json({ success: true, message: `Brand "${removed.name}" removed successfully` });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('Brands API error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};
