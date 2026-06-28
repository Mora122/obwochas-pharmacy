/**
 * Build-time script: Fetches products from MongoDB and generates static JSON files.
 * These are served from CDN instantly — no cold starts, no "Loading..." spinners.
 *
 * Runs during `vercel build` as the buildCommand.
 */
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'static-data');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'your_mongodb_connection_string') {
    console.log('[STATIC] No MONGODB_URI set, skipping static data generation');
    fs.mkdirSync(OUT_DIR, { recursive: true });
    // Write empty files so the site doesn't 404
    fs.writeFileSync(path.join(OUT_DIR, 'products.json'), JSON.stringify({ success: true, count: 0, products: [] }));
    fs.writeFileSync(path.join(OUT_DIR, 'brands.json'), JSON.stringify({ success: true, brands: [] }));
    return;
  }

  let client;
  try {
    client = new MongoClient(uri, {
      serverApi: { version: '1', strict: true, deprecationErrors: true }
    });
    await client.connect();
    const db = client.db('obwochas_pharmacy');

    console.log('[STATIC] Connected to MongoDB');

    // Fetch products
    const allProducts = await db.collection('products').find({}).toArray();
    const products = allProducts.map(p => ({
      id: p._id.toString(),
      _id: p._id.toString(),
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.stock || 0,
      description: p.description || '',
      image: p.image || '',
      active: p.active !== false,
      featured: !!p.featured,
      specialOffer: !!p.specialOffer,
      originalPrice: p.originalPrice || p.price,
      discount: p.discount || 0
    }));

    const featured = products.filter(p => p.featured && p.active !== false);
    const specialOffers = products.filter(p => p.specialOffer && p.active !== false);

    const productData = {
      success: true,
      count: products.length,
      products,
      featured,
      specialOffers
    };

    // Fetch brands
    let brands = [];
    try {
      brands = await db.collection('brands').find({}).sort({ name: 1 }).toArray();
      brands = brands.map(b => ({
        id: b._id.toString(),
        name: b.name,
        icon: b.icon,
        slug: b.slug,
        image: b.image || `https://placehold.co/200x200/1a5c2e/ffffff?text=${encodeURIComponent(b.name)}`
      }));
    } catch (e) {
      console.warn('[STATIC] Brands fetch failed:', e.message);
    }

    // Write files
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'products.json'), JSON.stringify(productData));
    fs.writeFileSync(path.join(OUT_DIR, 'brands.json'), JSON.stringify({ success: true, brands }));

    console.log(`[STATIC] Written ${products.length} products, ${brands.length} brands`);
    console.log(`[STATIC] Featured: ${featured.length}, Special offers: ${specialOffers.length}`);

  } catch (e) {
    console.error('[STATIC] Error:', e.message);
    // Write empty fallback
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(path.join(OUT_DIR, 'products.json'), JSON.stringify({ success: true, count: 0, products: [] }));
    fs.writeFileSync(path.join(OUT_DIR, 'brands.json'), JSON.stringify({ success: true, brands: [] }));
  } finally {
    if (client) await client.close();
  }
}

main().catch(e => {
  console.error('[STATIC] Fatal:', e);
  process.exit(1);
});
