/**
 * Obwocha's Pharmacy — Dynamic Products Loader
 * Fetches products from the API and renders them on the storefront.
 */

const API = '/api';

/**
 * Fetch products from the API
 * @param {Object} filters - { category?, search?, all? }
 */
async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.all) params.set('all', 'true');
  if (filters.category) params.set('category', filters.category);
  if (filters.search) params.set('search', filters.search);
  if (filters.limit) params.set('limit', filters.limit);

  const url = `${API}/products${params.toString() ? '?' + params.toString() : ''}`;
  try {
    const r = await fetch(url);
    const d = await r.json();
    if (d.success) return d.products || [];
    console.error('API error:', d.error);
    return [];
  } catch (e) {
    console.error('Fetch error:', e);
    return [];
  }
}

/**
 * Build a product card HTML element from product data
 */
function createProductCard(product, useNumericalId) {
  const id = useNumericalId !== undefined ? useNumericalId : product.id;
  const hasOldPrice = product.oldPrice && product.oldPrice > product.price;
  const discount = hasOldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const stars = renderStars(product.rating || 4);
  const imgSrc = product.image || `images/placeholder.svg`;

  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-img">
      <img loading="lazy" src="${imgSrc}" onerror="this.src='images/placeholder.svg'" alt="${escapeHtml(product.name)}" style="width:100%;height:100%;object-fit:contain;">
    </div>
    <div class="product-body">
      <div class="brand">${escapeHtml(product.brand || product.category || '')}</div>
      <h3><a href="product.html?id=${id}">${escapeHtml(product.name)}</a></h3>
      <div class="stars">${stars}</div>
      <div class="price">
        ${hasOldPrice ? `<span class="old">KSh ${Number(product.oldPrice).toLocaleString()}</span> ` : ''}
        KSh ${Number(product.price).toLocaleString()}
      </div>
      ${hasOldPrice ? `<span class="sale-badge">-${discount}%</span>` : ''}
      <div class="product-actions">
        <a href="product.html?id=${id}" class="btn btn-sm">View</a>
        <a href="#" onclick="addToCart('${id}',1);return false;" class="btn btn-primary btn-sm">Add to Cart</a>
      </div>
    </div>
  `;
  return card;
}

/**
 * Render star ratings
 */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let s = '';
  for (let i = 0; i < full; i++) s += '<span class="filled">★</span>';
  if (half) s += '<span class="half">★</span>';
  for (let i = 0; i < empty; i++) s += '<span>★</span>';
  s += `<span class="rating-text">(${Math.floor(Math.random() * 100 + 20)})</span>`;
  return s;
}

/**
 * Render products into a container element
 */
function renderProducts(products, containerSelector, options = {}) {
  const container = typeof containerSelector === 'string'
    ? document.querySelector(containerSelector)
    : containerSelector;
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = '<div style="padding:40px;text-align:center;color:#999;grid-column:1/-1">No products found</div>';
    return;
  }

  container.innerHTML = '';
  const limit = options.limit || products.length;
  for (let i = 0; i < Math.min(limit, products.length); i++) {
    const p = products[i];
    const card = createProductCard(p, options.startId ? options.startId + i : p.id);
    container.appendChild(card);
  }
}

/**
 * Load featured products into a grid
 */
async function loadFeaturedProducts(limit = 6) {
  const products = await fetchProducts({ limit: 50 });
  const grids = document.querySelectorAll('.product-grid');
  if (grids.length > 0 && products.length > 0) {
    renderProducts(products.slice(0, limit), grids[0]);
  }
  return products;
}

/**
 * Load all products for shop page
 */
async function loadShopProducts(filters = {}) {
  const products = await fetchProducts(filters);
  const grid = document.getElementById('shopProductGrid') || document.querySelector('.shop-page .product-grid');
  if (grid) {
    renderProducts(products, grid);
  }
  
  // Update count
  const countEl = document.getElementById('productCount');
  if (countEl) countEl.textContent = products.length;
  
  return products;
}

// Utility
function escapeHtml(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}
