// Products API — GET /api/products, POST /api/products, PATCH /api/products, DELETE /api/products
const { connect } = require('./db');
const productsDb = require('./products_db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const conn = await connect();
    
    // Seed products on first call
    await productsDb.seedProducts(conn);

    // GET — Single product or list
    if (req.method === 'GET') {
      if (req.query.id) {
        const product = await productsDb.getProduct(conn, req.query.id);
        if (!product) {
          return res.status(404).json({ success: false, error: 'Product not found' });
        }
        return res.json({ success: true, product });
      }
      
      const filter = {};
      if (req.query.category) filter.category = req.query.category;
      if (req.query.search) filter.search = req.query.search;
      if (req.query.all === 'true') filter.active = undefined;
      else filter.active = req.query.active !== 'false';

      const products = await productsDb.getProducts(conn, filter);
      return res.json({ success: true, count: products.length, products });
    }

    // POST — Create product (admin)
    if (req.method === 'POST') {
      const { name, category, price, stock, description, image } = req.body || {};
      if (!name || !category || !price) {
        return res.status(400).json({ success: false, error: 'Name, category, and price are required' });
      }
      const product = await productsDb.createProduct(conn, { name, category, price: Number(price), stock: Number(stock || 0), description: description || '', image: image || '' });
      return res.json({ success: true, product });
    }

    // PATCH — Update product (admin)
    if (req.method === 'PATCH') {
      const productId = req.query.id;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID required' });
      }
      const updates = {};
      const fields = ['name', 'category', 'price', 'stock', 'description', 'image', 'active'];
      for (const f of fields) {
        if (req.body[f] !== undefined) updates[f] = f === 'price' || f === 'stock' ? Number(req.body[f]) : req.body[f];
      }
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, error: 'No fields to update' });
      }
      const product = await productsDb.updateProduct(conn, productId, updates);
      if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
      return res.json({ success: true, product });
    }

    // DELETE — Delete product (admin)
    if (req.method === 'DELETE') {
      const productId = req.query.id;
      if (!productId) {
        return res.status(400).json({ success: false, error: 'Product ID required' });
      }
      const deleted = await productsDb.deleteProduct(conn, productId);
      if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (e) {
    console.error('Products API error:', e);
    return res.status(500).json({ success: false, error: e.message });
  }
};
