// Migration: Update existing MongoDB products with real Pixabay images
// Usage: node scripts/update-product-images.js
// This updates image URLs for products that still have placehold.co URLs

const { connect } = require('../lib/db');

// Category → Image URL mapping (same as products_db.js)
const CATEGORY_IMAGES = {
  'Pain Relief': 'https://cdn.pixabay.com/photo/2019/02/22/08/39/tablets-4013077_1280.jpg',
  'Allergy & Skin Care': 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg',
  'Cold & Flu': 'https://cdn.pixabay.com/photo/2016/07/24/21/01/thermometer-1539191_1280.jpg',
  'Vitamins & Supplements': 'https://cdn.pixabay.com/photo/2020/10/02/09/01/tablets-5620566_1280.jpg',
  'First Aid': 'https://cdn.pixabay.com/photo/2018/01/14/21/36/first-aid-3082670_1280.jpg',
  'Digestive Health': 'https://cdn.pixabay.com/photo/2020/06/17/06/24/ibs-5308379_1280.jpg',
  'Baby Care': 'https://cdn.pixabay.com/photo/2018/01/08/09/46/pill-3069032_1280.jpg',
  'Diabetes Care': 'https://cdn.pixabay.com/photo/2015/05/21/11/16/diabetes-777001_1280.jpg'
};

async function updateProductImages() {
  console.log('Connecting to MongoDB...');
  const conn = await connect();
  if (conn.mode !== 'mongodb') {
    console.log('Not using MongoDB mode. Skipping migration.');
    console.log('Using local storage — image URLs are already updated in seed data.');
    return;
  }
  
  const col = conn.db.collection('products');
  const products = await col.find({}).toArray();
  console.log(`Found ${products.length} products in DB.`);
  
  let updated = 0;
  
  for (const p of products) {
    const oldImg = p.image;
    // Skip products that don't have placehold URLs (already updated)
    if (oldImg && !oldImg.includes('placehold.co')) {
      continue;
    }
    
    const newImg = CATEGORY_IMAGES[p.category] || CATEGORY_IMAGES['Pain Relief'];
    
    await col.updateOne(
      { _id: p._id },
      { $set: { image: newImg, updatedAt: new Date().toISOString() } }
    );
    
    console.log(`  ✓ ${p.name} (${p.category}): ${oldImg?.slice(0,30)||'none'}... → ${newImg.slice(0,30)}...`);
    updated++;
  }
  
  console.log(`\n✅ Done! Updated ${updated} products with real images.`);
  process.exit(0);
}

updateProductImages().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
