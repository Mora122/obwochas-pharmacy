/**
 * Static Data Builder — Pre-builds product & brand JSON for instant page loads
 *
 * Run: node scripts/build-static.js
 * Env: MONGODB_URI=... (optional — if not set, uses seed data)
 *
 * Output:
 *   static-data/products.json — all products + featured + special offers
 *   static-data/brands.json   — all brands
 *   static-data/meta.json     — metadata (lastBuilt, counts)
 */

const fs = require('fs');
const path = require('path');

const STATIC_DIR = path.join(__dirname, '..', 'static-data');

// Ensure output directory exists
if (!fs.existsSync(STATIC_DIR)) {
  fs.mkdirSync(STATIC_DIR, { recursive: true });
}

// ============= SEED DATA (fallback when MongoDB unavailable) =============

const SEED_PRODUCTS = [
  { id: 'PROD-001', name: 'Panadol Extra 500mg', category: 'Pain Relief', price: 150, stock: 100, description: 'Fast relief from headaches, muscle aches, toothache, and fever. Paracetamol 500mg + Caffeine 65mg.', image: 'https://cdn.pixabay.com/photo/2019/02/22/08/39/tablets-4013077_1280.jpg', active: true, featured: true, specialOffer: false },
  { id: 'PROD-002', name: 'Brufen 400mg', category: 'Pain Relief', price: 180, stock: 80, description: 'Ibuprofen 400mg for relief of rheumatic pain, muscular pain, backache, dental pain, and fever.', image: 'https://cdn.pixabay.com/photo/2019/02/22/08/39/tablets-4013077_1280.jpg', active: true, featured: true, specialOffer: false },
  { id: 'PROD-003', name: 'Voltaren Emulgel 50g', category: 'Pain Relief', price: 650, stock: 40, description: 'Diclofenac diethylamine gel for local relief of pain and inflammation in muscles and joints.', image: 'https://cdn.pixabay.com/photo/2019/02/22/08/39/tablets-4013077_1280.jpg', active: true, featured: false, specialOffer: true },
  { id: 'PROD-004', name: 'Diclofenac Sodium 50mg', category: 'Pain Relief', price: 120, stock: 90, description: 'Anti-inflammatory pain relief for arthritis, muscle strains, and post-operative pain.', image: 'https://cdn.pixabay.com/photo/2019/02/22/08/39/tablets-4013077_1280.jpg', active: true, featured: false, specialOffer: true },
  { id: 'PROD-005', name: 'Piriton Tablets', category: 'Allergy & Skin Care', price: 80, stock: 120, description: 'Chlorpheniramine 4mg for relief of allergic conditions including hay fever, hives, and insect bites.', image: 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-006', name: 'Zyrtec 10mg', category: 'Allergy & Skin Care', price: 250, stock: 60, description: 'Cetirizine 10mg once-daily relief for hay fever, year-round allergies, and hives.', image: 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-007', name: 'Benadryl Antihistamine', category: 'Allergy & Skin Care', price: 200, stock: 70, description: 'Diphenhydramine 25mg for allergy relief, motion sickness, and as a nighttime sleep aid.', image: 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-008', name: 'Cetaphil Gentle Skin Cleanser 500ml', category: 'Allergy & Skin Care', price: 1200, stock: 25, description: 'Soap-free gentle cleanser for sensitive, dry, or allergy-prone skin.', image: 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg', active: true, featured: true, specialOffer: false },
  { id: 'PROD-009', name: 'Lemsip Max Sachets (10 pack)', category: 'Cold & Flu', price: 550, stock: 50, description: 'Hot lemon drink for fast relief of cold and flu symptoms including fever, body aches, and congestion.', image: 'https://cdn.pixabay.com/photo/2016/07/24/21/01/thermometer-1539191_1280.jpg', active: true, featured: true, specialOffer: true },
  { id: 'PROD-010', name: 'Nasivin Nasal Spray', category: 'Cold & Flu', price: 380, stock: 40, description: 'Fast-acting nasal decongestant spray for blocked nose due to colds and allergies.', image: 'https://cdn.pixabay.com/photo/2016/07/24/21/01/thermometer-1539191_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-011', name: 'Strepsils Honey & Lemon (24 pack)', category: 'Cold & Flu', price: 280, stock: 80, description: 'Dual-action lozenges to soothe sore throats and kill bacteria causing throat infections.', image: 'https://cdn.pixabay.com/photo/2016/07/24/21/01/thermometer-1539191_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-012', name: 'Vitamin C 1000mg', category: 'Vitamins & Supplements', price: 350, stock: 65, description: 'High-strength Vitamin C to support immune system, collagen formation, and antioxidant protection.', image: 'https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg', active: true, featured: true, specialOffer: false },
  { id: 'PROD-013', name: 'Multivitamin Daily', category: 'Vitamins & Supplements', price: 450, stock: 55, description: 'Complete daily multivitamin with essential vitamins and minerals for overall health and wellness.', image: 'https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg', active: true, featured: true, specialOffer: false },
  { id: 'PROD-014', name: 'Vitamin D3 2000IU', category: 'Vitamins & Supplements', price: 400, stock: 45, description: 'Supports bone health, immune function, and calcium absorption. Essential for all ages.', image: 'https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-015', name: 'Omega-3 Fish Oil 1000mg', category: 'Vitamins & Supplements', price: 550, stock: 35, description: 'Rich in EPA and DHA for heart health, brain function, and joint mobility.', image: 'https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-016', name: 'Iron + Vitamin B12', category: 'Vitamins & Supplements', price: 320, stock: 50, description: 'Combined iron and B12 supplement for energy, red blood cell production, and combating fatigue.', image: 'https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-017', name: 'Plasters Assorted (50 pack)', category: 'First Aid', price: 120, stock: 150, description: 'Waterproof fabric plasters in assorted sizes for minor cuts and wounds protection.', image: 'https://cdn.pixabay.com/photo/2018/01/14/21/36/first-aid-3082670_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-018', name: 'Bandages Crepe 4in - 4m', category: 'First Aid', price: 200, stock: 60, description: 'Elastic crepe bandage for sprains, strains, and compression support.', image: 'https://cdn.pixabay.com/photo/2018/01/14/21/36/first-aid-3082670_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-019', name: 'Dettol Antiseptic 500ml', category: 'First Aid', price: 380, stock: 40, description: 'Concentrated antiseptic disinfectant for cuts, wounds, and home hygiene.', image: 'https://cdn.pixabay.com/photo/2018/01/14/21/36/first-aid-3082670_1280.jpg', active: true, featured: true, specialOffer: false },
  { id: 'PROD-020', name: 'Maalox Plus Suspension 250ml', category: 'Digestive Health', price: 420, stock: 35, description: 'Antacid with simethicone for heartburn, indigestion, and excess stomach gas relief.', image: 'https://cdn.pixabay.com/photo/2020/06/17/06/24/ibs-5308379_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-021', name: 'Immodium Capsules (12 pack)', category: 'Digestive Health', price: 300, stock: 45, description: 'Loperamide 2mg for rapid relief of acute diarrhea and traveler\'s diarrhea.', image: 'https://cdn.pixabay.com/photo/2020/06/17/06/24/ibs-5308379_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-022', name: 'Piriton Baby Syrup 100ml', category: 'Baby Care', price: 250, stock: 30, description: 'Gentle antihistamine syrup for babies and children for allergies and insect bites.', image: 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-023', name: 'Calpol Baby Drops 60ml', category: 'Baby Care', price: 350, stock: 40, description: 'Paracetamol infant drops for fever reduction and pain relief in babies 2+ months.', image: 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg', active: true, featured: false, specialOffer: false },
  { id: 'PROD-024', name: 'Glucophage 500mg', category: 'Diabetes Care', price: 600, stock: 60, description: 'Metformin 500mg for management of type 2 diabetes. Helps control blood sugar levels.', image: 'https://cdn.pixabay.com/photo/2015/05/21/11/16/diabetes-777001_1280.jpg', active: true, featured: true, specialOffer: true }
];

const SEED_BRANDS = [
  { id: 'BRAND-001', name: 'Panadol', slug: 'panadol', image: '', icon: '💊' },
  { id: 'BRAND-002', name: 'Brufen', slug: 'brufen', image: '', icon: '💊' },
  { id: 'BRAND-003', name: 'Voltaren', slug: 'voltaren', image: '', icon: '🧴' },
  { id: 'BRAND-004', name: 'Piriton', slug: 'piriton', image: '', icon: '💊' },
  { id: 'BRAND-005', name: 'Cetaphil', slug: 'cetaphil', image: '', icon: '🧴' },
  { id: 'BRAND-006', name: 'Lemsip', slug: 'lemsip', image: '', icon: '🍋' },
  { id: 'BRAND-007', name: 'Strepsils', slug: 'strepsils', image: '', icon: '🍬' },
  { id: 'BRAND-008', name: 'Dettol', slug: 'dettol', image: '', icon: '🧴' },
  { id: 'BRAND-009', name: 'Maalox', slug: 'maalox', image: '', icon: '💧' },
  { id: 'BRAND-010', name: 'Glucophage', slug: 'glucophage', image: '', icon: '💊' }
];

// ============= Main Build =============

async function build() {
  console.log('[build-static] Starting...');
  const startTime = Date.now();

  let products = [];
  let brands = [];

  const mongoUri = process.env.MONGODB_URI;
  const useMongo = mongoUri && mongoUri !== 'your_mongodb_connection_string';

  if (useMongo) {
    try {
      const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
      const client = new MongoClient(mongoUri, { serverApi: ServerApiVersion.v1 });
      await client.connect();
      const db = client.db('obwochas_pharmacy');

      console.log('[build-static] Connected to MongoDB');

      // Fetch products
      const productsCursor = db.collection('products').find({}).sort({ name: 1 });
      products = await productsCursor.toArray();
      products = products.map(p => ({
        id: p.id || p._id.toString(),
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        description: p.description,
        image: p.image,
        active: p.active !== false,
        featured: p.featured === true,
        specialOffer: p.specialOffer === true,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));

      // Fetch brands
      try {
        const brandsCursor = db.collection('brands').find({}).sort({ name: 1 });
        brands = await brandsCursor.toArray();
        brands = brands.map(b => ({
          id: b.id || b._id.toString(),
          name: b.name,
          slug: b.slug,
          image: b.image || '',
          icon: b.icon || ''
        }));
      } catch (e) {
        console.warn('[build-static] Brands collection not found, using seed:', e.message);
        brands = SEED_BRANDS;
      }

      await client.close();
      console.log(`[build-static] Fetched ${products.length} products, ${brands.length} brands from MongoDB`);
    } catch (e) {
      console.warn('[build-static] MongoDB error, falling back to seed data:', e.message);
      products = SEED_PRODUCTS;
      brands = SEED_BRANDS;
    }
  } else {
    console.log('[build-static] No MONGODB_URI set, using seed data');
    products = SEED_PRODUCTS;
    brands = SEED_BRANDS;
  }

  // Separate into collections
  const activeProducts = products.filter(p => p.active !== false);
  const featuredProducts = products.filter(p => p.featured === true);
  const specialOfferProducts = products.filter(p => p.specialOffer === true);

  // Write products.json
  const productsOutput = {
    lastBuilt: new Date().toISOString(),
    count: activeProducts.length,
    products: activeProducts,
    featured: { count: featuredProducts.length, products: featuredProducts },
    specialOffers: { count: specialOfferProducts.length, products: specialOfferProducts }
  };
  fs.writeFileSync(
    path.join(STATIC_DIR, 'products.json'),
    JSON.stringify(productsOutput, null, 2)
  );
  console.log(`[build-static] Wrote static-data/products.json (${activeProducts.length} active, ${featuredProducts.length} featured, ${specialOfferProducts.length} special offers)`);

  // Write brands.json
  const brandsOutput = {
    lastBuilt: new Date().toISOString(),
    count: brands.length,
    brands
  };
  fs.writeFileSync(
    path.join(STATIC_DIR, 'brands.json'),
    JSON.stringify(brandsOutput, null, 2)
  );
  console.log(`[build-static] Wrote static-data/brands.json (${brands.length} brands)`);

  // Write meta.json
  const meta = {
    lastBuilt: new Date().toISOString(),
    elapsed: Date.now() - startTime,
    products: { total: products.length, active: activeProducts.length, featured: featuredProducts.length, specialOffers: specialOfferProducts.length },
    brands: brands.length,
    source: useMongo ? 'mongodb' : 'seed'
  };
  fs.writeFileSync(
    path.join(STATIC_DIR, 'meta.json'),
    JSON.stringify(meta, null, 2)
  );
  console.log(`[build-static] Complete in ${meta.elapsed}ms`);
}

build().catch(err => {
  console.error('[build-static] Fatal error:', err);
  process.exit(1);
});
