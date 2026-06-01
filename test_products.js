const db = require('./api/products_db');

async function test() {
  try {
    const conn = { mode: 'memory', db: null };
    const seeds = await db.seedProducts(conn);
    console.log('Seeded:', seeds.length, 'products (0 = already seeded)');
    
    const products = await db.getProducts(conn, {});
    console.log('Products found:', products.length);
    products.forEach(p => console.log('  -', p.id, '|', p.name, '| KSh', p.price, '| stock:', p.stock, '|', p.category));
    
    // Test category filter
    const painRelief = await db.getProducts(conn, { category: 'Pain Relief' });
    console.log('\nPain Relief products:', painRelief.length);
    
    // Test search
    const searchResults = await db.getProducts(conn, { search: 'vitamin' });
    console.log('Search results for "vitamin":', searchResults.length);
    
    // Test create
    const newProd = await db.createProduct(conn, { name: 'Test Product', category: 'First Aid', price: 100, stock: 10 });
    console.log('\nCreated:', newProd.id, newProd.name);
    
    // Test update
    const updated = await db.updateProduct(conn, newProd.id, { price: 150, stock: 20 });
    console.log('Updated:', updated.name, 'price:', updated.price, 'stock:', updated.stock);
    
    // Test delete
    const deleted = await db.deleteProduct(conn, newProd.id);
    console.log('Deleted:', deleted);
    
    const all = await db.getProducts(conn, {});
    console.log('\nFinal count:', all.length);
    console.log('\n✅ ALL TESTS PASSED');
  } catch(e) {
    console.error('ERROR:', e.stack);
  }
}
test();
