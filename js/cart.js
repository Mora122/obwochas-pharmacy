/**
 * Obwocha's Pharmacy — Shopping Cart System
 * Uses localStorage for persistence across pages
 * Handles: add, remove, update quantity, badge sync
 */
const OBOCHA_CART_KEY = 'obwocha_cart';

const ProductDB = {
  1: { name: "Wellman Multivitamin 30 Tablets", price: 1850, image: "wellman.png", brand: "Wellman", sku: "WLM-30" },
  2: { name: "CeraVe Moisturising Cream 454g", price: 2690, image: "cerave_cream.jpg", brand: "CeraVe", sku: "CRV-454" },
  3: { name: "Pampers Premium Care Diapers Size 4 (48s)", price: 1450, image: "pampers.jpg", brand: "Pampers", sku: "PMP-48" },
  4: { name: "Dettol Antiseptic Disinfectant 500ml", price: 520, image: "dettol_antiseptic.jpg", brand: "Dettol", sku: "DTL-500" },
  5: { name: "Sante Herbal Green Tea 20 Bags", price: 380, image: "sante_tea.jpg", brand: "Sante", sku: "SNT-20" },
  6: { name: "Colgate Total Advanced Whitening 100ml", price: 450, image: "colgate.jpg", brand: "Colgate", sku: "CLG-100" },
  7: { name: "Opti-Nutrition Whey Protein 2kg - Chocolate", price: 4500, image: "opti_whey.jpg", brand: "Optimum Nutrition", sku: "OPT-2K" },
  8: { name: "Nivea Sun Protect & Moisture SPF 50 200ml", price: 3020, image: "nivea_sun.jpg", brand: "Nivea", sku: "NIV-200" },
  9: { name: "Seven Seas Heart Health Omega-3 30 Capsules", price: 1650, image: "seven_seas.jpg", brand: "Seven Seas", sku: "SVS-30" },
  10: { name: "Optrex Eye Drops 10ml", price: 890, image: "optrex.jpg", brand: "Optrex", sku: "OPX-10" },
  11: { name: "Piriton Allergy Relief Tablets 30s", price: 680, image: "piriton.jpg", brand: "Piriton", sku: "PRT-30" },
  12: { name: "Brufen Ibuprofen 400mg 100 Tablets", price: 520, image: "brufen.jpg", brand: "Brufen", sku: "BRF-100" },
  13: { name: "CeraVe Hydrating Cleanser 473ml", price: 2190, image: "cerave_foam.jpg", brand: "CeraVe", sku: "CRV-473" },
  14: { name: "CeraVe AM Facial Moisturizing Lotion SPF30", price: 2450, image: "cerave_am.jpg", brand: "CeraVe", sku: "CRV-AM" },
  15: { name: "CeraVe PM Facial Moisturizing Lotion", price: 2450, image: "cerave_pm.png", brand: "CeraVe", sku: "CRV-PM" },
  16: { name: "CeraVe Retinol Serum 30ml", price: 3890, image: "cerave_retinol.jpg", brand: "CeraVe", sku: "CRV-RT" },
  17: { name: "CeraVe Daily Moisturizing Lotion 473ml", price: 2290, image: "cerave_lotion.jpg", brand: "CeraVe", sku: "CRV-DL" },
  18: { name: "Panadol Extra 500mg 30 Tablets", price: 350, image: "panadol_extra.jpg", brand: "Panadol", sku: "PND-30" },
  19: { name: "Cetirizine 10mg 30 Tablets", price: 280, image: "cetirizine.jpg", brand: "Cetirizine", sku: "CTZ-30" },
  20: { name: "Vitamin C 1000mg 60 Tablets", price: 890, image: "vitamin_c.jpg", brand: "Vit-C", sku: "VTC-60" },
  21: { name: "Omega-3 Fish Oil 1000mg 60 Softgels", price: 1200, image: "omega3.jpg", brand: "Omega-3", sku: "OM3-60" },
  22: { name: "Amoxicillin 500mg 21 Capsules", price: 650, image: "amoxicillin.jpg", brand: "Amoxil", sku: "AMX-21" },
  23: { name: "Multivitamin Daily 60 Tablets", price: 750, image: "multivitamin.jpg", brand: "Multi-V", sku: "MTV-60" },
  24: { name: "Hand Sanitizer 500ml", price: 420, image: "hand_sanitizer.jpg", brand: "Sanitize", sku: "SAN-500" }
};

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
    const prod = ProductDB[productId];
    if (!prod) { console.error('Unknown product:', productId); return; }
    cart.push({ id: productId, qty: qty, name: prod.name, price: prod.price, image: prod.image, brand: prod.brand, sku: prod.sku });
  }
  saveCart(cart);
  showToast('Added to cart ✓');
}

function removeFromCart(productId) {
  let cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCart();
}

function updateQty(productId, qty) {
  if (qty < 1) { removeFromCart(productId); return; }
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
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
            <div class="cart-product-img"><img src="images/${item.image}" alt="${item.name}" style="width:80px;height:80px;object-fit:contain;"></div>
            <div>
              <strong>${item.name}</strong><br>
              <span style="font-size:12px;color:var(--text-muted);">SKU: ${item.sku}</span>
            </div>
          </div>
        </td>
        <td>KSh ${item.price.toLocaleString()}</td>
        <td>
          <div class="qty-selector" style="margin:0;">
            <button onclick="updateQty(${item.id}, ${item.qty - 1})">−</button>
            <input type="number" value="${item.qty}" min="1" style="width:40px;" onchange="updateQty(${item.id}, parseInt(this.value) || 1)">
            <button onclick="updateQty(${item.id}, ${item.qty + 1})">+</button>
          </div>
        </td>
        <td><strong>KSh ${sub.toLocaleString()}</strong></td>
        <td><button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">✕</button></td>
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
