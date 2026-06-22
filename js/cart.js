/**
 * Obwocha's Pharmacy — Shopping Cart System
 * Uses localStorage for persistence across pages
 * Handles: add, remove, update quantity, badge sync
 */
const OBOCHA_CART_KEY = 'obwocha_cart';

// Load products from API dynamically (replaces hardcoded ProductDB for live data)
let ApiProductDB = {};

async function loadApiProducts() {
  try {
    const r = await fetch('/api/products?all=true');
    const d = await r.json();
    if (d.success && d.products) {
      ApiProductDB = {};
      window.ProductDB = {};
      d.products.forEach(function(p) {
        // Build lookup by product id (e.g. PROD-001)
        ApiProductDB[p.id] = p;
        window.ProductDB[p.id] = { name: p.name, price: p.price, image: p.image, brand: p.category, sku: p.id };
        // Also map by numeric ID for backward compat (e.g. '1' from old hardcoded DB)
        var num = p.id.replace('PROD-', '');
        ApiProductDB[num] = p;
        window.ProductDB[num] = { name: p.name, price: p.price, image: p.image, brand: p.category, sku: p.id };
        // Also map by productId if different
        if (p.productId && p.productId !== p.id) {
          ApiProductDB[p.productId] = p;
          window.ProductDB[p.productId] = { name: p.name, price: p.price, image: p.image, brand: p.category, sku: p.id };
        }
      });
      // Export to window for other scripts
      window.ApiProductDB = ApiProductDB;
      window.ApiProducts = d.products;
      return true;
    }
  } catch(e) {
    console.warn('Failed to load products from API, using fallback', e);
  }
}

// Load API products on page load (runs early, non-blocking)
document.addEventListener('DOMContentLoaded', function() {
  loadApiProducts();
});


function getCart() {
  try { return JSON.parse(localStorage.getItem(OBOCHA_CART_KEY)) || []; } 
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(OBOCHA_CART_KEY, JSON.stringify(cart));
  updateBadge();
}

function updateBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.badge').forEach(b => b.textContent = total);
}

function addToCart(productId, qty) {
  qty = qty || 1;
  let cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    // Lookup product: 1) API-loaded DB first (live data), 2) window.ProductDB (fallback), 3) SKU search
    let prod = null;
    if (ApiProductDB[productId]) {
      prod = ApiProductDB[productId];
    } else if (window.ProductDB && window.ProductDB[productId]) {
      prod = window.ProductDB[productId];
    } else if (window.ApiProductDB && window.ApiProductDB[productId]) {
      prod = window.ApiProductDB[productId];
    } else {
      // Try finding by SKU in API products
      if (window.ApiProducts) {
        var skuMatch = window.ApiProducts.find(function(p) { return p.sku === productId; });
        if (skuMatch) prod = skuMatch;
      }
    }
    if (!prod) {
      console.error('Unknown product:', productId);
      return;
    }
    cart.push({ id: productId, qty: qty, name: prod.name, price: prod.price, image: prod.image, brand: prod.brand, sku: prod.sku });
  }
  saveCart(cart);
  showToast('Added to cart ✓');
}

function removeFromCart(productId) {
  let cart = getCart().filter(i => String(i.id) !== String(productId));
  saveCart(cart);
  renderCart();
}

function updateQty(productId, qty) {
  if (qty < 1) { removeFromCart(productId); return; }
  let cart = getCart();
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) { item.qty = qty; saveCart(cart); renderCart(); }
}

function clearCart() {
  localStorage.removeItem(OBOCHA_CART_KEY);
  updateBadge();
  renderCart();
}

function getCartCount() {
  return getCart().reduce((s, i) => s + i.qty, 0);
}

function getCartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}

function renderCart() {
  const container = document.querySelector('.cart-table tbody');
  const summary = document.querySelector('.cart-summary');
  if (!container) return;

  const cart = getCart();
  
  if (cart.length === 0) {
    container.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:60px 20px;"><h3>Your cart is empty</h3><p style="margin:10px 0;color:#666;">Start shopping to add items!</p><a href="shop.html" class="btn btn-primary" style="display:inline-block;margin-top:10px;">Browse Products →</a></td></tr>';
    if (summary) {
      summary.innerHTML = `
        <h3>📋 Order Summary</h3>
        <p style="text-align:center;padding:20px 0;color:var(--text-muted);">No items in cart</p>
        <a href="shop.html" style="display:block;text-align:center;font-size:13px;">← Start Shopping</a>
      `;
    }
    return;
  }

  let rows = '';
  let totalItems = 0;
  let subtotal = 0;
  
  cart.forEach(item => {
    const sub = item.price * item.qty;
    subtotal += sub;
    totalItems += item.qty;
    rows += `
      <tr>
        <td>
          <div class="cart-product">
            <div class="cart-product-img">${item.image ? '<img  src="' + (item.image.startsWith('http') ? item.image : 'images/' + item.image) + '" alt="' + item.name + '" style="width:80px;height:80px;object-fit:contain;" onerror="this.onerror=null;this.closest(\'tr\').querySelector(\'img\').src=\'images/placeholder.svg\'">' : '<img src="images/placeholder.svg" alt="' + item.name + '"  style="width:80px;height:80px;object-fit:contain;padding:8px;background:#f5f8f5;border-radius:8px">'}</div>
            <div>
              <strong>${item.name}</strong><br>
              <span style="font-size:12px;color:var(--text-muted);">SKU: ${item.sku || 'N/A'}</span>
            </div>
          </div>
        </td>
        <td>KSh ${item.price.toLocaleString()}</td>
        <td>
          <div class="qty-selector" style="margin:0;">
            <button onclick="updateQty('${item.id}', ${item.qty - 1})">−</button>
            <input type="number" value="${item.qty}" min="1" style="width:40px;" onchange="updateQty('${item.id}', parseInt(this.value) || 1)">
            <button onclick="updateQty('${item.id}', ${item.qty + 1})">+</button>
          </div>
        </td>
        <td><strong>KSh ${sub.toLocaleString()}</strong></td>
        <td><button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">✕</button></td>
      </tr>
    `;
  });

  container.innerHTML = rows;

  if (summary) {
    const discount = subtotal > 2500 ? 0 : 0; // free delivery when > 2500
    const delivery = subtotal > 2500 ? 0 : 350;
    const total = subtotal + delivery;
    summary.innerHTML = `
      <h3>📋 Order Summary</h3>
      <div class="row"><span>Subtotal (${totalItems} items)</span><span>KSh ${subtotal.toLocaleString()}</span></div>
      <div class="row"><span>Delivery</span><span style="color:${delivery === 0 ? 'var(--primary)' : 'inherit'};font-weight:600;">${delivery === 0 ? 'FREE' : 'KSh 350'}</span></div>
      <div class="row total"><span>Total</span><span>KSh ${total.toLocaleString()}</span></div>
      <p style="font-size:12px;color:var(--text-muted);margin:8px 0;">Free delivery on orders above KSh 2,500</p>
      <a href="checkout.html" class="btn btn-primary" style="width:100%;text-align:center;padding:14px;display:block;">Proceed to Checkout →</a>
      <a href="shop.html" style="display:block;text-align:center;margin-top:8px;font-size:13px;">← Continue Shopping</a>
      <button onclick="clearCart()" style="display:block;width:100%;margin-top:8px;padding:8px;background:none;border:1px solid #c00;color:#c00;border-radius:4px;cursor:pointer;font-size:12px;">🗑️ Clear Cart</button>
    `;
  }
}

function renderCheckoutSummary() {
  const container = document.getElementById('checkoutSummary');
  if (!container) return;

  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text-muted);">Your cart is empty. <a href="shop.html">Shop now</a></p>';
    return;
  }

  let itemsHtml = '';
  let totalItems = 0;
  let subtotal = 0;

  cart.forEach(item => {
    const sub = item.price * item.qty;
    subtotal += sub;
    totalItems += item.qty;
    itemsHtml += `<div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:14px;"><span>${item.name} × ${item.qty}</span><span>KSh ${sub.toLocaleString()}</span></div>`;
  });

  const delivery = subtotal > 2500 ? 0 : 350;
  const total = subtotal + delivery;

  container.innerHTML = `
    ${itemsHtml}
    <hr style="margin:12px 0;border-color:var(--border);">
    <div style="display:flex;justify-content:space-between;font-size:14px;"><span>Subtotal (${totalItems} items)</span><span>KSh ${subtotal.toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;color:var(--primary);font-weight:600;"><span>Delivery</span><span>${delivery === 0 ? 'FREE' : 'KSh ' + delivery}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:20px;font-weight:800;color:var(--primary);margin-top:12px;border-top:2px solid var(--primary);padding-top:12px;"><span>Total</span><span id="totalAmount">KSh ${total.toLocaleString()}</span></div>
    <p style="font-size:12px;color:var(--text-muted);margin-top:8px;">🚚 Free delivery on orders above KSh 2,500</p>
  `;
}

function showToast(msg) {
  const existing = document.querySelector('.cart-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '20px', right: '20px', zIndex: '99999',
    background: 'var(--primary)', color: 'white', padding: '14px 24px',
    borderRadius: '8px', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    transition: 'opacity 0.3s'
  });
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);
}

// Auto-run on page load
document.addEventListener('DOMContentLoaded', function() {
  updateBadge();
  if (document.querySelector('.cart-table tbody')) renderCart();
  if (document.getElementById('checkoutSummary')) renderCheckoutSummary();
});
