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

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
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
      deleteUrl: `https://obwochas-pharmacy.vercel.app/view-prescription.html?id=${id}`,
    });
  } catch (err) {
    console.error('Prescription upload error:', err);
    return res.status(500).json({ success: false, error: 'Server error uploading prescription' });
  }
};
