const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
let cachedDb = null;

async function connect() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(uri);
  await client.connect();
  cachedDb = client.db('obwocha_pharmacy');
  return cachedDb;
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'POST') {
      // --- Upload prescription ---
      const { name, phone, email, deliveryMethod, nearestStore, notes, fileName, fileBase64, fileSize } = req.body;

      if (!fileBase64) {
        return res.status(400).json({ success: false, error: 'No prescription file provided' });
      }
      if (!name || !phone) {
        return res.status(400).json({ success: false, error: 'Name and phone are required' });
      }

      const db = await connect();
      const collection = db.collection('prescriptions');

      const doc = {
        name,
        phone,
        email: email || '',
        deliveryMethod: deliveryMethod || 'Store Collection',
        nearestStore: nearestStore || '',
        notes: notes || '',
        fileName: fileName || 'prescription',
        fileSize: fileSize || 0,
        fileData: fileBase64,
        status: 'pending',
        createdAt: new Date(),
        viewed: false,
      };

      const result = await collection.insertOne(doc);
      const id = result.insertedId.toString();

      return res.status(200).json({
        success: true,
        id,
        viewUrl: `https://obwochas-pharmacy.vercel.app/view-prescription.html?id=${id}`,
      });
    }

    if (req.method === 'GET') {
      // --- Fetch prescription by ID ---
      const id = req.query.id;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Missing prescription ID' });
      }

      const db = await connect();
      const collection = db.collection('prescriptions');

      let doc;
      try {
        doc = await collection.findOne({ _id: new ObjectId(id) });
      } catch {
        return res.status(404).json({ success: false, error: 'Invalid prescription ID' });
      }

      if (!doc) {
        return res.status(404).json({ success: false, error: 'Prescription not found' });
      }

      return res.status(200).json({
        success: true,
        prescription: {
          id: doc._id.toString(),
          name: doc.name,
          phone: doc.phone,
          email: doc.email,
          deliveryMethod: doc.deliveryMethod,
          nearestStore: doc.nearestStore,
          notes: doc.notes,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          status: doc.status,
          createdAt: doc.createdAt,
          fileData: doc.fileData,
        }
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('Prescription API error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
