// Prescription Upload API — Accepts prescription submissions with file data
// GET /api/prescription — list all prescriptions (admin only)
// POST /api/prescription — submit a new prescription (public)

const { requireAdmin } = require('../lib/auth');

let client = null;
let db = null;
let memoryPrescriptions = [];
let prescCounter = 1;

async function connect() {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI !== 'your_mongodb_connection_string') {
    try {
      const { MongoClient, ServerApiVersion } = require('mongodb');
      if (!client) {
        client = new MongoClient(process.env.MONGODB_URI, { serverApi: ServerApiVersion.v1 });
        await client.connect();
        db = client.db('obwochas_pharmacy');
        await db.collection('prescriptions').createIndex({ createdAt: -1 });
        await db.collection('prescriptions').createIndex({ status: 1 });
      }
      return { mode: 'mongodb', db };
    } catch (e) {
      console.warn('MongoDB connection failed, using memory store:', e.message);
      return { mode: 'memory', db: null };
    }
  }
  return { mode: 'memory', db: null };
}

function generateId() {
  return 'PRX-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  // POST — public: submit a prescription
  if (req.method === 'POST') {
    try {
      const { name, phone, email, deliveryMethod, nearestStore, notes, fileName, fileSize, fileBase64 } = req.body || {};

      if (!name || !phone || !fileBase64) {
        return res.status(400).json({ success: false, error: 'Name, phone, and prescription file are required' });
      }

      const conn = await connect();
      const prescId = generateId();
      const prescription = {
        id: prescId,
        name: name.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        deliveryMethod: deliveryMethod || 'pickup',
        nearestStore: nearestStore || '',
        notes: notes || '',
        fileName: fileName || 'prescription.png',
        fileSize: fileSize || 0,
        fileBase64: fileBase64,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (conn.mode === 'mongodb') {
        const result = await conn.db.collection('prescriptions').insertOne(prescription);
        prescription._id = result.insertedId.toString();
      } else {
        memoryPrescriptions.push(prescription);
      }

      return res.json({
        success: true,
        message: 'Prescription submitted successfully!',
        id: prescId,
        viewUrl: `https://obwochas-pharmacy.vercel.app/view-prescription.html?id=${prescId}`
      });

    } catch (error) {
      console.error('Prescription submission error:', error);
      return res.status(500).json({ success: false, error: 'Failed to submit prescription. Please try again.' });
    }
  }

  // GET — admin only: list all or get single prescription
  if (req.method === 'GET') {
    const singleId = req.query?.id;

    // If a specific ID is requested, allow admin auth + return full data
    if (singleId) {
      const user = requireAdmin(req, res);
      if (!user) return;

      try {
        const conn = await connect();
        let prescription;

        if (conn.mode === 'mongodb') {
          prescription = await conn.db.collection('prescriptions').findOne({ id: singleId });
        } else {
          prescription = memoryPrescriptions.find(p => p.id === singleId);
        }

        if (!prescription) {
          return res.status(404).json({ success: false, error: 'Prescription not found' });
        }

        return res.json({ success: true, prescription });

      } catch (error) {
        console.error('Get prescription error:', error);
        return res.status(500).json({ success: false, error: 'Failed to load prescription' });
      }
    }

    // List all (admin only)
    const user = requireAdmin(req, res);
    if (!user) return;

    try {
      const conn = await connect();
      let prescriptions;

      if (conn.mode === 'mongodb') {
        prescriptions = await conn.db.collection('prescriptions')
          .find({})
          .sort({ createdAt: -1 })
          .toArray();
      } else {
        prescriptions = [...memoryPrescriptions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      // Strip base64 data from list view for performance
      const safeList = prescriptions.map(p => {
        const { fileBase64, ...rest } = p;
        return {
          ...rest,
          hasFile: !!fileBase64,
          fileSizeKB: fileBase64 ? Math.round(fileBase64.length * 0.75 / 1024) : 0
        };
      });

      return res.json({ success: true, count: safeList.length, prescriptions: safeList });

    } catch (error) {
      console.error('List prescriptions error:', error);
      return res.status(500).json({ success: false, error: 'Failed to load prescriptions' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
};
