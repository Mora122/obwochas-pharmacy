

var API = '/api';

var allOrders = [];

var allProducts = [];

var allProductsRaw = [];

var searchTimer;

var STOCK_THRESHOLD = 20;



/* ========= TABS ========= */

function switchTab(tab) {

  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });

  document.querySelectorAll('.tab-content').forEach(function(c) { c.style.display = 'none'; });

  document.querySelector('.tab-btn[data-tab="' + tab + '"]').classList.add('active');

  document.getElementById('tab-' + tab).style.display = 'block';

  if (tab === 'orders') loadOrders();

  if (tab === 'products') loadProducts();

}



/* ========= ORDERS ========= */

function debounceSearch() {

  clearTimeout(searchTimer);

  searchTimer = setTimeout(loadOrders, 300);

}



async function loadOrders() {

  document.getElementById('orderList').innerHTML = '<div class="loading">Loading...</div>';

  try {

    var r = await fetch(API + '/orders');

    var d = await r.json();

    if (!d.success) {

      document.getElementById('orderList').innerHTML = '<div class="error">' + d.error + '</div>';

      return;

    }

    allOrders = d.orders || [];

    renderOrders();

  } catch(e) {

    document.getElementById('orderList').innerHTML = '<div class="error">Connection error</div>';

  }

}



function renderOrders() {

  var sf = document.getElementById('statusFilter').value;

  var sq = document.getElementById('searchBox').value.toLowerCase();

  var filtered = allOrders;

  if (sf) filtered = filtered.filter(function(o) { return o.status === sf; });

  if (sq) filtered = filtered.filter(function(o) {

    var c = o.customer || {};

    return (c.name + ' ' + c.phone + ' ' + c.email + ' ' + o.id).toLowerCase().includes(sq);

  });

  updateOrderStats();

  var el = document.getElementById('orderList');

  if (filtered.length === 0) {

    el.innerHTML = '<div style="padding:60px;text-align:center;color:#999">No orders found</div>';

    return;

  }

  var html = '';

  for (var i = 0; i < filtered.length; i++) {

    var o = filtered[i];

    var c = o.customer || {};

    var sc = 'status-' + (o.status || 'pending');

    var t = o.total || (o.totals ? o.totals.total : 0);

    var ic = typeof o.items === 'number' ? o.items : (o.items ? o.items.length : 0);

    var dt = o.createdAt ? new Date(o.createdAt).toLocaleString('en-KE', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '';

    html += '<div class="order-card" onclick="showOrderDetail(\'' + o._id + '\')">' +

      '<div><div class="order-id">#' + (o.id || o._id) + '</div><div style="font-size:13px;color:#333">' + (c.name || 'Guest') + '<br><small style="color:#888">' + (c.phone || '') + '</small></div></div>' +

      '<div style="text-align:center"><span class="status-badge ' + sc + '">' + (o.status || 'pending') + '</span><br><span style="font-size:12px;color:#666">' + ic + ' item' + (ic !== 1 ? 's' : '') + '</span></div>' +

      '<div style="text-align:right"><div class="total">KSh ' + Number(t).toLocaleString() + '</div><div class="date">' + dt + '</div></div></div>';

  }

  el.innerHTML = html;

}



function updateOrderStats() {

  var s = {pending:0,confirmed:0,processing:0,shipped:0,delivered:0,cancelled:0};

  for (var i = 0; i < allOrders.length; i++) {

    var st = allOrders[i].status;

    if (s[st] !== undefined) s[st]++;

  }

  document.getElementById('statPending').textContent = s.pending + s.confirmed;

  document.getElementById('statProcessing').textContent = s.processing;

  document.getElementById('statShipped').textContent = s.shipped;

  document.getElementById('statDelivered').textContent = s.delivered;

}



async function showOrderDetail(id) {

  var panel = document.getElementById('orderDetail');

  try {

    var r = await fetch(API + '/order?id=' + id);

    var d = await r.json();

    if (!d.success || !d.order) {

      panel.innerHTML = '<div class="error">Order not found</div>';

      panel.classList.add('active');

      return;

    }

    var o = d.order;

    var c = o.customer || {};

    var p = o.payment || {};

    var t = o.totals || {};

    var sc = 'status-' + (o.status || 'pending');

    var itemsHtml = '';

    var itemsCount = typeof o.items === 'number' ? o.items : 0;
    var items = [];
    for (var i = 0; i < itemsCount; i++) {

      var item = items[i] || {};

      var lineTotal = (item.price || 0) * (item.quantity || 1);

      itemsHtml += '<tr><td>' + (item.name || '') + '</td><td>' + (item.quantity || 1) + '</td><td>KSh ' + Number(item.price || 0).toLocaleString() + '</td><td>KSh ' + Number(lineTotal).toLocaleString() + '</td></tr>';

    }

    var statusOpts = ['pending','confirmed','processing','shipped','delivered','cancelled'];

    var selHtml = '';

    for (var i = 0; i < statusOpts.length; i++) {

      selHtml += '<option value="' + statusOpts[i] + '"' + (o.status === statusOpts[i] ? ' selected' : '') + '>' + statusOpts[i].charAt(0).toUpperCase() + statusOpts[i].slice(1) + '</option>';

    }

    var oid = o.id || id;

    panel.innerHTML =

      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +

        '<h3 style="margin:0;color:var(--primary)">Order #' + oid + '</h3>' +

        '<span class="status-badge ' + sc + '" style="font-size:14px;padding:6px 16px">' + (o.status || '') + '</span>' +

      '</div>' +

      '<div class="detail-grid">' +

        '<div class="detail-section"><h4>Customer</h4><p><strong>Name:</strong> ' + (c.name || '') + '</p><p><strong>Phone:</strong> ' + (c.phone || '') + '</p><p><strong>Email:</strong> ' + (c.email || '') + '</p><p><strong>Address:</strong> ' + (c.address || '') + '</p></div>' +

        '<div class="detail-section"><h4>Payment</h4><p><strong>Method:</strong> ' + (p.method || '') + '</p><p><strong>Status:</strong> ' + (p.status || '') + '</p></div>' +

      '</div>' +

      '<div class="detail-section"><h4>Items (' + itemsCount + ')</h4><table class="order-items-table"><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>' + itemsHtml + '</table></div>' +

      '<div class="detail-grid">' +

        '<div class="detail-section"><h4>Totals</h4><p><strong>Subtotal:</strong> KSh ' + Number(t.subtotal || 0).toLocaleString() + '</p><p><strong>Shipping:</strong> ' + (t.shipping === 0 ? 'FREE' : 'KSh ' + Number(t.shipping).toLocaleString()) + '</p><p><strong style="font-size:16px">Total:</strong> <strong style="color:var(--primary);font-size:18px">KSh ' + Number(t.total || 0).toLocaleString() + '</strong></p></div>' +

        '<div class="detail-section"><h4>Timeline</h4><p><strong>Created:</strong> ' + (o.createdAt ? new Date(o.createdAt).toLocaleString('en-KE') : '') + '</p><p><strong>Updated:</strong> ' + (o.updatedAt ? new Date(o.updatedAt).toLocaleString('en-KE') : '') + '</p></div>' +

      '</div>' +

      '<div class="status-update"><strong style="font-size:13px">Update Status:</strong> <select id="statusSelect">' + selHtml + '</select> <button class="btn btn-primary" onclick="updateOrderStatus(\'' + (o.id || id) + '\')" style="font-size:12px">Update</button> <button class="btn" onclick="document.getElementById(\'orderDetail\').classList.remove(\'active\')" style="font-size:12px">Close</button></div>';

    panel.classList.add('active');

    panel.scrollIntoView({behavior:'smooth',block:'start'});

  } catch(e) {

    panel.innerHTML = '<div class="error">Error: ' + e.message + '</div>';

    panel.classList.add('active');

  }

}



async function updateOrderStatus(id) {

  var status = document.getElementById('statusSelect').value;

  try {

    var r = await fetch(API + '/order?id=' + id, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:status})});

    var d = await r.json();

    if (d.success) {

      loadOrders();

      showOrderDetail(id);

    } else {

      alert('Error: ' + d.error);

    }

  } catch(e) {

    alert('Error: ' + e.message);

  }

}



/* ========= PRODUCTS ========= */

function debounceProductSearch() {

  clearTimeout(searchTimer);

  searchTimer = setTimeout(loadProducts, 300);

}



async function loadProducts() {

  document.getElementById('productList').innerHTML = '<div class="loading">Loading products...</div>';

  try {

    var cat = document.getElementById('prodCategoryFilter').value;

    var search = document.getElementById('prodSearchBox').value;

    var url = API + '/products?all=true';

    if (cat) url += '&category=' + encodeURIComponent(cat);

    if (search) url += '&search=' + encodeURIComponent(search);

    var r = await fetch(url);

    var d = await r.json();

    if (!d.success) {

      document.getElementById('productList').innerHTML = '<div class="error">' + d.error + '</div>';

      return;

    }

    allProductsRaw = d.products || [];

    var stockFilter = document.getElementById('prodStockFilter').value;

    if (stockFilter === 'low') {

      allProducts = allProductsRaw.filter(function(p) { return p.stock > 0 && p.stock < STOCK_THRESHOLD; });

    } else if (stockFilter === 'out') {

      allProducts = allProductsRaw.filter(function(p) { return p.stock <= 0; });

    } else if (stockFilter === 'ok') {

      allProducts = allProductsRaw.filter(function(p) { return p.stock >= STOCK_THRESHOLD; });

    } else {

      allProducts = allProductsRaw.slice();

    }

    renderProducts();

  } catch(e) {

    document.getElementById('productList').innerHTML = '<div class="error">Connection error</div>';

  }

}



function renderProducts() {

  var el = document.getElementById('productList');

  // Sort
  var sortBy = document.getElementById('prodSortBy').value;
  var sorted = allProducts.slice();
  if (sortBy === 'stock_asc') {
    sorted.sort(function(a,b) { return (a.stock||0) - (b.stock||0); });
  } else if (sortBy === 'stock_desc') {
    sorted.sort(function(a,b) { return (b.stock||0) - (a.stock||0); });
  } else if (sortBy === 'price_asc') {
    sorted.sort(function(a,b) { return Number(a.price||0) - Number(b.price||0); });
  } else if (sortBy === 'price_desc') {
    sorted.sort(function(a,b) { return Number(b.price||0) - Number(a.price||0); });
  } else {
    sorted.sort(function(a,b) { return (a.name||'').localeCompare(b.name||''); });
  }

  if (sorted.length === 0) {
    el.innerHTML = '<div style="padding:60px;text-align:center;color:#999">No products match current filters.</div>';
    document.getElementById('inventorySummary').style.display = 'none';
    document.getElementById('stockAlertBanner').style.display = 'none';
    return;
  }

  var html = '';
  var totalStock = 0;
  var totalValue = 0;
  var lowStock = 0;
  var categories = {};

  for (var i = 0; i < sorted.length; i++) {
    var p = sorted[i];
    totalStock += (p.stock || 0);
    totalValue += (p.stock || 0) * (p.price || 0);
    if (p.stock !== undefined && p.stock > 0 && p.stock < STOCK_THRESHOLD) lowStock++;
    if (!categories[p.category]) categories[p.category] = 0;
    categories[p.category]++;

    var stockClass = p.stock <= 0 ? 'stock-out' : p.stock < STOCK_THRESHOLD ? 'stock-low' : 'stock-ok';
    var stockLabel = p.stock <= 0 ? 'OUT OF STOCK' : p.stock + ' in stock';

    html += '<div class="product-card">' +
      '<div style="flex:1">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' • ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>' +
      '<div style="text-align:center;min-width:120px">' +
        '<div class="prod-price">KSh ' + Number(p.price).toLocaleString() + '</div>' +
        '<div class="prod-stock ' + stockClass + '">' + stockLabel + '</div>' +
        '<div style="display:flex;gap:4px;justify-content:center;margin-top:4px">' +
          '<button onclick="quickStock(\'' + p.id + '\',10)" style="font-size:10px;padding:2px 8px;background:#e8f5e9;color:#2e7d32;border:none;border-radius:3px;cursor:pointer;font-weight:600">+10</button>' +
          '<button onclick="quickStock(\'' + p.id + '\',-5)" style="font-size:10px;padding:2px 8px;background:#ffebee;color:#c62828;border:none;border-radius:3px;cursor:pointer;font-weight:600">-5</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:4px">' +
        '<button class="btn btn-primary" onclick="showEditProduct(\'' + p.id + '\')" style="font-size:11px;padding:6px 12px">Edit</button>' +
        '<button class="btn" onclick="deleteProduct(\'' + p.id + '\',\'' + p.name.replace(/'/g,"\\'") + '\')" style="font-size:11px;padding:6px 12px;background:#ffebee;color:#c62828;border:none;border-radius:4px;cursor:pointer">Del</button>' +
      '</div></div>';
  }

  el.innerHTML = html;

  // Inventory summary (global)
  var globalTotalStock = 0;
  var globalLow = 0;
  var globalCats = {};
  var globalValue = 0;
  for (var i = 0; i < allProductsRaw.length; i++) {
    var gp = allProductsRaw[i];
    globalTotalStock += (gp.stock || 0);
    globalValue += (gp.stock || 0) * (gp.price || 0);
    if (gp.stock !== undefined && gp.stock > 0 && gp.stock < STOCK_THRESHOLD) globalLow++;
    if (!globalCats[gp.category]) globalCats[gp.category] = 0;
    globalCats[gp.category]++;
  }
  var globalCatCount = Object.keys(globalCats).length;
  document.getElementById('inventorySummary').style.display = 'block';
  document.getElementById('inventorySummary').innerHTML =
    '<strong>📊 Inventory</strong> — ' + allProductsRaw.length + ' products, ' + globalCatCount + ' categories &nbsp;|&nbsp; ' +
    '<span class="stock-ok">✅ ' + (allProductsRaw.length - globalLow) + ' in stock</span> &nbsp;|&nbsp; ' +
    '<span class="stock-low">⚠️ ' + globalLow + ' low stock</span> &nbsp;|&nbsp; ' +
    '📦 ' + globalTotalStock + ' units &nbsp;|&nbsp; ' +
    '<strong>KSh ' + Number(globalValue).toLocaleString() + '</strong> total value';

  // Stock alert banner
  var banner = document.getElementById('stockAlertBanner');
  var outOfStock = allProductsRaw.filter(function(p) { return p.stock <= 0; });
  if (globalLow > 0 || outOfStock.length > 0) {
    var msg = '';
    if (globalLow > 0) msg += '⚠️ <strong>' + globalLow + ' items</strong> running low (under ' + STOCK_THRESHOLD + ')';
    if (outOfStock.length > 0) {
      if (msg) msg += ' &nbsp;|&nbsp; ';
      msg += '🛑 <strong>' + outOfStock.length + ' item' + (outOfStock.length > 1 ? 's' : '') + '</strong> out of stock';
    }
    banner.style.display = 'block';
    banner.innerHTML = '<div style="padding:12px 16px;background:#fff3e0;border:1px solid #ffcc80;border-radius:8px;margin-bottom:12px;font-size:13px;color:#e65100">' + msg + '</div>';
  } else {
    banner.style.display = 'none';
  }
}



function showAddProduct() {

  document.getElementById('modalTitle').textContent = 'Add New Product';

  document.getElementById('editProductId').value = '';

  document.getElementById('prodName').value = '';

  document.getElementById('prodCategory').value = 'Pain Relief';

  document.getElementById('prodPrice').value = '';

  document.getElementById('prodStock').value = '50';

  document.getElementById('prodDesc').value = '';

  document.getElementById('prodImage').value = '';

  document.getElementById('productModal').classList.add('open');

}



function showEditProduct(id) {

  var p = allProducts.find(function(x) { return x.id === id; });

  if (!p) return;

  document.getElementById('modalTitle').textContent = 'Edit Product: ' + p.name;

  document.getElementById('editProductId').value = id;

  document.getElementById('prodName').value = p.name || '';

  document.getElementById('prodCategory').value = p.category || 'Pain Relief';

  document.getElementById('prodPrice').value = p.price || 0;

  document.getElementById('prodStock').value = p.stock || 0;

  document.getElementById('prodDesc').value = p.description || '';

  document.getElementById('prodImage').value = p.image || '';

  document.getElementById('productModal').classList.add('open');

}



function closeModal() {

  document.getElementById('productModal').classList.remove('open');

}



async function saveProduct() {

  var id = document.getElementById('editProductId').value;

  var data = {

    name: document.getElementById('prodName').value.trim(),

    category: document.getElementById('prodCategory').value,

    price: document.getElementById('prodPrice').value,

    stock: document.getElementById('prodStock').value || 0,

    description: document.getElementById('prodDesc').value.trim(),

    image: document.getElementById('prodImage').value.trim()

  };

  if (!data.name || !data.price) { alert('Name and price are required'); return; }

  

  try {

    var r;

    if (id) {

      r = await fetch(API + '/products?id=' + id, {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});

    } else {

      r = await fetch(API + '/products', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});

    }

    var d = await r.json();

    if (d.success) {

      closeModal();

      loadProducts();

    } else {

      alert('Error: ' + d.error);

    }

  } catch(e) {

    alert('Error: ' + e.message);

  }

}



async function deleteProduct(id, name) {

  if (!confirm('Delete "' + name + '" permanently?')) return;

  try {

    var r = await fetch(API + '/products?id=' + id, {method:'DELETE'});

    var d = await r.json();

    if (d.success) {

      loadProducts();

    } else {

      alert('Error: ' + d.error);

    }

  } catch(e) {

    alert('Error: ' + e.message);

  }

}



// Auto-refresh

loadOrders();

// ======== INVENTORY UPGRADES ========
function quickStock(id, delta) {
  var p = allProductsRaw.find(function(x) { return x.id === id; });
  if (!p) return;
  var newStock = Math.max(0, (p.stock || 0) + delta);
  if (!confirm('Adjust "' + p.name + '": ' + (p.stock||0) + ' -> ' + newStock + ' (' + (delta > 0 ? '+' : '') + delta + ')')) return;
  fetch('/api/products?id=' + id, {
    method: 'PATCH',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ stock: newStock })
  }).then(function(r) { return r.json(); }).then(function(d) {
    if (d.success) { loadProducts(); }
    else { alert('Error: ' + d.error); }
  });
}

function showBulkStock() {
  var html = '';
  for (var i = 0; i < allProductsRaw.length; i++) {
    var p = allProductsRaw[i];
    var checked = (p.stock !== undefined && p.stock < STOCK_THRESHOLD) ? 'checked' : '';
    html += '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f0f0f0;cursor:pointer">' +
      '<input type="checkbox" class="bulk-chk" value="' + p.id + '" ' + checked + '>' +
      '<span style="flex:1;font-size:13px">' + p.name + '</span>' +
      '<span class="' + (p.stock < STOCK_THRESHOLD ? 'stock-low' : 'stock-ok') + '" style="font-size:12px">' + (p.stock||0) + '</span>' +
      '</label>';
  }
  html += '<div style="margin-top:8px;font-size:11px;color:#999;text-align:right"><span onclick="document.querySelectorAll(\'.bulk-chk\').forEach(function(e){e.checked=true})" style="cursor:pointer;color:#1565c0;text-decoration:underline">Select all</span> | <span onclick="document.querySelectorAll(\'.bulk-chk\').forEach(function(e){e.checked=false})" style="cursor:pointer;color:#1565c0;text-decoration:underline">Clear</span></div>';
  document.getElementById('bulkProductList').innerHTML = html;
  document.getElementById('bulkStockAdjust').value = '0';
  document.getElementById('bulkStockModal').classList.add('open');
}

function closeBulkModal() {
  document.getElementById('bulkStockModal').classList.remove('open');
}

async function applyBulkStock() {
  var adjust = parseInt(document.getElementById('bulkStockAdjust').value) || 0;
  if (adjust === 0) { alert('Enter a stock adjustment value first.'); return; }
  var checked = document.querySelectorAll('.bulk-chk:checked');
  if (checked.length === 0) { alert('Select at least one product.'); return; }
  var updates = [];
  for (var i = 0; i < checked.length; i++) {
    var id = checked[i].value;
    var p = allProductsRaw.find(function(x) { return x.id === id; });
    if (!p) continue;
    var newStock = Math.max(0, (p.stock || 0) + adjust);
    updates.push({ id: id, stock: newStock, name: p.name });
  }
  var confirmMsg = 'Apply ' + (adjust > 0 ? '+' : '') + adjust + ' to ' + updates.length + ' products?';
  if (!confirm(confirmMsg)) return;
  var ok = 0, fail = 0;
  for (var i = 0; i < updates.length; i++) {
    try {
      var r = await fetch('/api/products?id=' + updates[i].id, {
        method: 'PATCH',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ stock: updates[i].stock })
      });
      var d = await r.json();
      if (d.success) ok++;
      else { fail++; }
    } catch(e) { fail++; }
  }
  alert('Updated ' + ok + ' products' + (fail ? ' (' + fail + ' failed)' : '') + '.');
  closeBulkModal();
  loadProducts();
}

setInterval(loadOrders, 60000);

