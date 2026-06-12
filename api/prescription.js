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
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing prescription ID' });
  }

  try {
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
  } catch (err) {
    console.error('Prescription fetch error:', err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};
