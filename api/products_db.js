// Product Database Layer — extends db.js
// Add this to db.js or keep as separate module (imported by api/products.js)

let productsMemoryStore = [];
let productsIdCounter = 1;

const PRODUCT_CATEGORIES = [
  'Pain Relief',
  'Cold & Flu',
  'Vitamins & Supplements',
  'First Aid',
  'Baby Care',
  'Digestive Health',
  'Allergy & Skin Care',
  'Diabetes Care'
];

const SEED_PRODUCTS = [
  { name: 'Panadol Extra 500mg', category: 'Pain Relief', price: 150, stock: 100, description: 'Fast relief from headaches, muscle aches, toothache, and fever. Paracetamol 500mg + Caffeine 65mg.', image: '' },
  { name: 'Brufen 400mg', category: 'Pain Relief', price: 180, stock: 80, description: 'Ibuprofen 400mg for relief of rheumatic pain, muscular pain, backache, dental pain, and fever.', image: '' },
  { name: 'Voltaren Emulgel 50g', category: 'Pain Relief', price: 650, stock: 40, description: 'Diclofenac diethylamine gel for local relief of pain and inflammation in muscles and joints.', image: '' },
  { name: 'Diclofenac Sodium 50mg', category: 'Pain Relief', price: 120, stock: 90, description: 'Anti-inflammatory pain relief for arthritis, muscle strains, and post-operative pain.', image: '' },
  { name: 'Piriton Tablets', category: 'Allergy & Skin Care', price: 80, stock: 120, description: 'Chlorpheniramine 4mg for relief of allergic conditions including hay fever, hives, and insect bites.', image: '' },
  { name: 'Zyrtec 10mg', category: 'Allergy & Skin Care', price: 250, stock: 60, description: 'Cetirizine 10mg once-daily relief for hay fever, year-round allergies, and hives.', image: '' },
  { name: 'Benadryl Antihistamine', category: 'Allergy & Skin Care', price: 200, stock: 70, description: 'Diphenhydramine 25mg for allergy relief, motion sickness, and as a nighttime sleep aid.', image: '' },
  { name: 'Cetaphil Gentle Skin Cleanser 500ml', category: 'Allergy & Skin Care', price: 1200, stock: 25, description: 'Soap-free gentle cleanser for sensitive, dry, or allergy-prone skin.', image: '' },
  { name: 'Lemsip Max Sachets (10 pack)', category: 'Cold & Flu', price: 550, stock: 50, description: 'Hot lemon drink for fast relief of cold and flu symptoms including fever, body aches, and congestion.', image: '' },
  { name: 'Nasivin Nasal Spray', category: 'Cold & Flu', price: 380, stock: 40, description: 'Fast-acting nasal decongestant spray for blocked nose due to colds and allergies.', image: '' },
  { name: 'Strepsils Honey & Lemon (24 pack)', category: 'Cold & Flu', price: 280, stock: 80, description: 'Dual-action lozenges to soothe sore throats and kill bacteria causing throat infections.', image: '' },
  { name: 'Vitamin C 1000mg', category: 'Vitamins & Supplements', price: 350, stock: 65, description: 'High-strength Vitamin C to support immune system, collagen formation, and antioxidant protection.', image: '' },
  { name: 'Multivitamin Daily', category: 'Vitamins & Supplements', price: 450, stock: 55, description: 'Complete daily multivitamin with essential vitamins and minerals for overall health and wellness.', image: '' },
  { name: 'Vitamin D3 2000IU', category: 'Vitamins & Supplements', price: 400, stock: 45, description: 'Supports bone health, immune function, and calcium absorption. Essential for all ages.', image: '' },
  { name: 'Omega-3 Fish Oil 1000mg', category: 'Vitamins & Supplements', price: 550, stock: 35, description: 'Rich in EPA and DHA for heart health, brain function, and joint mobility.', image: '' },
  { name: 'Iron + Vitamin B12', category: 'Vitamins & Supplements', price: 320, stock: 50, description: 'Combined iron and B12 supplement for energy, red blood cell production, and combating fatigue.', image: '' },
  { name: 'Plasters Assorted (50 pack)', category: 'First Aid', price: 120, stock: 150, description: 'Waterproof fabric plasters in assorted sizes for minor cuts and wounds protection.', image: '' },
  { name: 'Bandages Crepe 4in - 4m', category: 'First Aid', price: 200, stock: 60, description: 'Elastic crepe bandage for sprains, strains, and compression support.', image: '' },
  { name: 'Dettol Antiseptic 500ml', category: 'First Aid', price: 380, stock: 40, description: 'Concentrated antiseptic disinfectant for cuts, wounds, and home hygiene.', image: '' },
  { name: 'Maalox Plus Suspension 250ml', category: 'Digestive Health', price: 420, stock: 35, description: 'Antacid with simethicone for heartburn, indigestion, and excess stomach gas relief.', image: '' },
  { name: 'Immodium Capsules (12 pack)', category: 'Digestive Health', price: 300, stock: 45, description: 'Loperamide 2mg for rapid relief of acute diarrhea and traveler\'s diarrhea.', image: '' },
  { name: 'Piriton Baby Syrup 100ml', category: 'Baby Care', price: 250, stock: 30, description: 'Gentle antihistamine syrup for babies and children for allergies and insect bites.', image: '' },
  { name: 'Calpol Baby Drops 60ml', category: 'Baby Care', price: 350, stock: 40, description: 'Paracetamol infant drops for fever reduction and pain relief in babies 2+ months.', image: '' },
  { name: 'Glucophage 500mg', category: 'Diabetes Care', price: 600, stock: 60, description: 'Metformin 500mg for management of type 2 diabetes. Helps control blood sugar levels.', image: '' }
];

function getProductsCollection(dbConn) {
  return dbConn.collection('products');
}

async function seedProducts(conn) {
  if (conn.mode === 'mongodb') {
    const col = getProductsCollection(conn.db);
    const count = await col.countDocuments();
    if (count === 0) {
      const products = SEED_PRODUCTS.map((p, i) => ({
        ...p,
        id: `PROD-${String(i + 1).padStart(3, '0')}`,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      await col.insertMany(products);
      await col.createIndex({ category: 1 });
      await col.createIndex({ name: 1 });
      return products;
    }
    return [];
  } else {
    if (productsMemoryStore.length === 0) {
      SEED_PRODUCTS.forEach((p, i) => {
        productsMemoryStore.push({
          ...p,
          id: `PROD-${String(i + 1).padStart(3, '0')}`,
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
      productsIdCounter = SEED_PRODUCTS.length + 1;
    }
    return [];
  }
}

async function getProducts(conn, filter = {}) {
  if (conn.mode === 'mongodb') {
    const col = getProductsCollection(conn.db);
    const query = {};
    if (filter.category) query.category = filter.category;
    if (filter.active !== undefined) query.active = filter.active;
    if (filter.search) query.name = { $regex: filter.search, $options: 'i' };
    if (filter.featured) query.featured = true;
    if (filter.specialOffer) query.specialOffer = true;
    return await col.find(query, { sort: { name: 1 } }).toArray();
  }
  let result = [...productsMemoryStore];
  if (filter.category) result = result.filter(p => p.category === filter.category);
  if (filter.active !== undefined) result = result.filter(p => p.active === filter.active);
  if (filter.search) result = result.filter(p => p.name.toLowerCase().includes(filter.search.toLowerCase()));
  if (filter.featured) result = result.filter(p => p.featured === true);
  if (filter.specialOffer) result = result.filter(p => p.specialOffer === true);
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

async function getProduct(conn, productId) {
  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      return await getProductsCollection(conn.db).findOne({
        $or: [{ id: productId }, { _id: new ObjectId(productId) }]
      });
    } catch {
      return await getProductsCollection(conn.db).findOne({ id: productId });
    }
  }
  return productsMemoryStore.find(p => p.id === productId || p._id === productId) || null;
}

async function createProduct(conn, productData) {
  const product = {
    ...productData,
    id: `PROD-${String(productsIdCounter++).padStart(3, '0')}`,
    active: productData.active !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (conn.mode === 'mongodb') {
    const result = await getProductsCollection(conn.db).insertOne(product);
    return { ...product, _id: result.insertedId.toString() };
  }
  productsMemoryStore.push(product);
  return product;
}

async function updateProduct(conn, productId, updates) {
  updates.updatedAt = new Date().toISOString();
  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      return await getProductsCollection(conn.db).findOneAndUpdate(
        { _id: new ObjectId(productId) },
        { $set: updates },
        { returnDocument: 'after' }
      );
    } catch {
      return await getProductsCollection(conn.db).findOneAndUpdate(
        { id: productId },
        { $set: updates },
        { returnDocument: 'after' }
      );
    }
  }
  const idx = productsMemoryStore.findIndex(p => p.id === productId);
  if (idx === -1) return null;
  Object.assign(productsMemoryStore[idx], updates);
  return productsMemoryStore[idx];
}

async function deleteProduct(conn, productId) {
  if (conn.mode === 'mongodb') {
    try {
      const { ObjectId } = require('mongodb');
      const result = await getProductsCollection(conn.db).deleteOne({ _id: new ObjectId(productId) });
      return result.deletedCount > 0;
    } catch {
      const result = await getProductsCollection(conn.db).deleteOne({ id: productId });
      return result.deletedCount > 0;
    }
  }
  const idx = productsMemoryStore.findIndex(p => p.id === productId);
  if (idx === -1) return false;
  productsMemoryStore.splice(idx, 1);
  return true;
}

module.exports = {
  PRODUCT_CATEGORIES,
  SEED_PRODUCTS,
  seedProducts,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};
