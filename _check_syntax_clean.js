

var API = '/api';
var allOrders = [];
var allProducts = [];
var searchTimer;

/* ========= AUTH ========= */
// JWT token stored in localStorage as 'obwochas_token'
function getToken() { return localStorage.getItem('obwochas_token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('obwochas_user') || 'null'); }
  catch { return null; }
}

// Wrap fetch to always include JWT token
var _origFetch = window.fetch;
window.fetch = function(url, opts) {
  opts = opts || {};
  opts.headers = opts.headers || {};
  var token = getToken();
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  return _origFetch.call(window, url, opts).then(function(r) {
    // On 401 Unauthorized, redirect to login
    if (r.status === 401 && !url.toString().includes('/login')) {
      handleLogout();
      throw new Error('Session expired. Please sign in again.');
    }
    return r;
  });
};

async function handleLogin() {
  var email = document.getElementById('loginEmail').value.trim();
  var password = document.getElementById('loginPassword').value;
  var errorEl = document.getElementById('loginError');
  var btn = document.getElementById('loginBtn');
  
  if (!email || !password) {
    errorEl.textContent = 'Email and password are required';
    errorEl.style.display = 'block';
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  errorEl.style.display = 'none';
  
  try {
(async function() {
    var r = await _origFetch.call(window, API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    var d = await r.json();
    if (d.success && d.token) {
      // Store token + user info
      localStorage.setItem('obwochas_token', d.token);
      localStorage.setItem('obwochas_user', JSON.stringify(d.user || {}));
      // Show dashboard
      document.getElementById('loginOverlay').style.display = 'none';
      document.getElementById('dashboardRoot').style.display = 'block';
      document.getElementById('userBadge').textContent = '👤 ' + (d.user.name || d.user.email || 'Admin');
      initDashboard();
    } else {
      errorEl.textContent = d.message || 'Invalid email or password';
      errorEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  } catch(e) {
    errorEl.textContent = 'Connection error. Please try again.';
    errorEl.style.display = 'block';
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
})();

function handleLogout() {
  localStorage.removeItem('obwochas_token');
  localStorage.removeItem('obwochas_user');
  document.getElementById('loginOverlay').style.display = 'flex';
  document.getElementById('dashboardRoot').style.display = 'none';
  document.getElementById('loginPassword').value = '';
}

// Initialize dashboard: check token on page load, show login or dashboard
function checkAuth() {
  var token = getToken();
  var user = getUser();
  if (token && user) {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('dashboardRoot').style.display = 'block';
    document.getElementById('userBadge').textContent = '👤 ' + (user.name || user.email || 'Admin');
    initDashboard();
  } else {
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('dashboardRoot').style.display = 'none';
  }
}

function initDashboard() {
  switchTab('dashboard');
  loadOrders();
  loadNotifications();
  updateNotifBadge();
  setInterval(loadOrders, 60000);
  setInterval(updateNotifBadge, 30000);
}

// Also add Enter key handler for login form
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('loginPassword').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleLogin();
  });
  checkAuth();
});



/* ========= TABS ========= */

function switchTab(tab) {

  document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });

  document.querySelectorAll('.tab-content').forEach(function(c) { c.style.display = 'none'; });

  document.querySelector('.tab-btn[data-tab="' + tab + '"]').classList.add('active');

  var el = document.getElementById('tab-' + tab);
  if (el) el.style.display = 'block';

  if (tab === 'dashboard') loadDashboard();
  if (tab === 'orders') loadOrders();
  if (tab === 'products') loadProducts();
    setTimeout(checkLowStock, 500);
  if (tab === 'users') loadUsers();
  if (tab === 'notifications') loadNotifications();
  if (tab === 'reviews') loadAdminReviews();

}



/* ========= ORDERS ========= */

/* ========= ORDERS ========= */

// Dashboard: load analytics
async 
  function checkLowStock() {
    var threshold = 10;
    fetch('/api/products').then(function(r){return r.json();}).then(function(prods){
      var low=prods.filter(function(p){return p.stock!==undefined&&p.stock>0&&p.stock<=threshold;});
      var out=prods.filter(function(p){return p.stock!==undefined&&p.stock===0;});
      var list=document.getElementById('lowStockList');
      if(!list)return;
      var h='';
      if(low.length>0){h+='<li><strong>'+low.length+' product(s) running low:</strong></li>';low.forEach(function(p){h+='<li>'+p.name+' <span style="color:#e65100;font-weight:600">('+p.stock+' left)</span></li>';});}
      if(out.length>0){h+='<li><strong>'+out.length+' product(s) out of stock:</strong></li>';out.forEach(function(p){h+='<li>'+p.name+' <span style="color:#c62828;font-weight:600">(Out of stock)</span></li>';});}
      list.innerHTML=h;
      var bn=document.getElementById('lowStockBanner');
      if(bn)bn.style.display=(low.length+out.length>0)?'block':'none';
    }).catch(function(e){console.log('Low stock check failed:',e);});
  }

  async function loadDashboard() {
  var revenue = document.getElementById('dashRevenue');
  var ordersCount = document.getElementById('dashOrders');
  var prodCount = document.getElementById('dashProducts');
  var userCount = document.getElementById('dashUsers');
  var topEl = document.getElementById('topProductsList');
  var recentEl = document.getElementById('recentOrdersList');
  if (!revenue) return;

  revenue.textContent = '...';
  try {
    var r = await fetch('/api/orders?analytics=1');
    var d = await r.json();
    if (!d.success || !d.stats) return;
    var s = d.stats;

    revenue.textContent = Number(s.totalRevenue || 0).toLocaleString();
    ordersCount.textContent = s.totalOrders || 0;
    prodCount.textContent = s.totalProducts || 0;
    userCount.textContent = s.totalUsers || 0;

    // Top products
    if (topEl) {
      if (s.topProducts && s.topProducts.length > 0) {
        topEl.innerHTML = s.topProducts.map(function(p) {
          return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0"><span>' + p.name + '</span><strong style="color:#2e7d32">' + p.count + ' sold</strong></div>';
        }).join('');
      } else {
        topEl.innerHTML = '<div style="color:#999;text-align:center;padding:20px">No sales data yet</div>';
      }
    }

    // Recent orders
    if (recentEl) {
      if (s.recentOrders && s.recentOrders.length > 0) {
        recentEl.innerHTML = '<table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f5f8f5"><th style="text-align:left;padding:8px 10px;font-size:12px">Order</th><th style="text-align:left;padding:8px 10px;font-size:12px">Customer</th><th style="text-align:left;padding:8px 10px;font-size:12px">Amount</th><th style="text-align:left;padding:8px 10px;font-size:12px">Status</th></tr></thead><tbody>' +
          s.recentOrders.map(function(o) {
            var statusColors = {pending:'#ff9800',processing:'#2196f3',shipped:'#9c27b0',delivered:'#4caf50',cancelled:'#f44336'};
            var color = statusColors[o.status] || '#999';
            return '<tr style="border-bottom:1px solid #f0f0f0"><td style="padding:8px 10px;font-size:13px">#' + (o.id ? o.id.slice(-6) : o.id) + '</td><td style="padding:8px 10px;font-size:13px">' + (o.name || 'Unknown') + '</td><td style="padding:8px 10px;font-size:13px">KSh ' + Number(o.total || 0).toLocaleString() + '</td><td style="padding:8px 10px;font-size:13px"><span style="display:inline-block;padding:2px 8px;border-radius:10px;background:' + color + '22;color:' + color + ';font-weight:600;font-size:11px">' + (o.status || 'pending') + '</span></td></tr>';
          }).join('') + '</tbody></table>';
      } else {
        recentEl.innerHTML = '<div style="color:#999;text-align:center;padding:20px">No orders yet</div>';
      }
    }

    // Draw simple bar chart
    drawRevenueChart(s.revenueByDay);

  } catch(e) {
    revenue.textContent = 'Error';
    console.error('Dashboard error:', e);
  }
}

// Simple canvas bar chart for revenue
function drawRevenueChart(data) {
  var canvas = document.getElementById('revenueChart');
  if (!canvas || !data || data.length === 0) return;
  var ctx = canvas.getContext('2d');
  var W = canvas.width = canvas.offsetWidth * 2;
  var H = canvas.height = 200 * 2;
  ctx.scale(2, 2);
  W /= 2; H /= 2;

  ctx.clearRect(0, 0, W, H);
  var values = data.map(function(d) { return d.revenue; });
  var max = Math.max.apply(null, values) || 1;
  var barW = Math.max(4, (W - 40) / values.length - 2);
  var pad = 20;

  ctx.fillStyle = '#2e7d32';
  for (var i = 0; i < values.length; i++) {
    var h = (values[i] / max) * (H - 40);
    var x = pad + i * (barW + 2);
    var y = H - pad - h;
    ctx.fillRect(x, y, barW, h);
  }

  // Average line
  var avg = values.reduce(function(a,b) { return a + b; }, 0) / values.length;
  var avgY = H - pad - (avg / max) * (H - 40);
  ctx.strokeStyle = '#ff5722';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(pad, avgY);
  ctx.lineTo(W - pad, avgY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Label
  ctx.fillStyle = '#ff5722';
  ctx.font = '10px sans-serif';
  ctx.fillText('Avg: KSh ' + avg.toFixed(0), W - 100, avgY - 4);
}

// Users: load registered customers
async function loadUsers() {
  var el = document.getElementById('userList');
  if (!el) return;
  el.innerHTML = '<div class="loading">Loading users...</div>';
  try {
    var search = (document.getElementById('userSearchBox') && document.getElementById('userSearchBox').value) || '';
    var r = await fetch('/api/users');
    var d = await r.json();
    if (!d.success) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#f44336">Failed to load users. Make sure you are signed in as admin.</div>';
      return;
    }
    if (!d.users || d.users.length === 0) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#999">No registered customers yet.</div>';
      return;
    }
    var rows = d.users.map(function(u) {
      var date = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A';
      return '<tr style="border-bottom:1px solid #f0f0f0">' +
        '<td style="padding:10px;font-size:13px"><strong>' + (u.name || 'Unknown') + '</strong></td>' +
        '<td style="padding:10px;font-size:13px">' + (u.email || '') + '</td>' +
        '<td style="padding:10px;font-size:13px">' + (u.phone || '-') + '</td>' +
        '<td style="padding:10px;font-size:13px">' + date + '</td>' +
        '<td style="padding:10px;font-size:13px">' + (u.points || 0) + '</td>' +
        '</tr>';
    }).join('');
    el.innerHTML = '<div style="font-size:12px;color:#888;margin-bottom:8px">Showing <strong>' + d.users.length + '</strong> registered customer(s)</div>' +
      '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse">' +
      '<thead><tr style="background:#f5f8f5"><th style="text-align:left;padding:10px;font-size:12px">Name</th><th style="text-align:left;padding:10px;font-size:12px">Email</th><th style="text-align:left;padding:10px;font-size:12px">Phone</th><th style="text-align:left;padding:10px;font-size:12px">Joined</th><th style="text-align:left;padding:10px;font-size:12px">Points</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  } catch(e) {
    el.innerHTML = '<div style="text-align:center;padding:40px;color:#f44336">Error loading users: ' + e.message + '</div>';
  }
}

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

    el.innerHTML = '<div style="padding:60px;text-align:center;color:#999">No orders found.</div>';

    return;

  }

  var html = '';

  for (var i = 0; i < filtered.length; i++) {

    var o = filtered[i];

    var c = o.customer || {};

    var t = o.totals ? o.totals.total : (o.total || 0);

    var dt = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-KE', {day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '';

    var ic = o.items || 0;

    var sc = 'status-' + (o.status || 'pending');

    var oid = (o.id || o._id || '').toString();

    html += '<div class="order-card" onclick="showOrderDetail(' + "'" + oid + "'" + ')">' +
      '<div style="flex:1;min-width:0">' +
        '<div class="prod-name">' + (c.name || 'Guest') + '</div>' +
        '<div style="font-size:11px;color:#888;margin-top:2px">' + (c.phone || '') + (c.email ? ' | ' + c.email : '') + '</div>' +
      '</div>' +
      '<div style="text-align:center">' +
        '<span class="status-badge ' + sc + '">' + (o.status || 'pending') + '</span><br>' +
        '<span style="font-size:12px;color:#666">' + ic + ' item' + (ic !== 1 ? 's' : '') + '</span>' +
      '</div>' +
      '<div style="text-align:right">' +
        '<div class="total">KSh ' + Number(t).toLocaleString() + '</div>' +
        (o.discount ? '<div style="font-size:11px;color:#c62828">Discounted</div>' : '') +
        '<div class="date">' + dt + '</div>' +
      '</div></div>';

  }

  el.innerHTML = html;

}function updateOrderStats() {

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

    var items = o.items || [];

    for (var i = 0; i < items.length; i++) {

      var item = items[i];

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

      '<div class="detail-section"><h4>Items (' + items.length + ')</h4><table class="order-items-table"><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>' + itemsHtml + '</table></div>' +

      '<div class="detail-grid">' +

        '<div class="detail-section"><h4>Totals</h4><p><strong>Subtotal:</strong> KSh ' + Number(t.subtotal || 0).toLocaleString() + '</p><p><strong>Shipping:</strong> ' + (t.shipping === 0 ? 'FREE' : 'KSh ' + Number(t.shipping).toLocaleString()) + '</p>' + (o.discount ? '<p><strong>Discount:</strong> <span style="color:#c62828">-' + (o.discount.type === 'percentage' ? o.discount.value + '%' : 'KSh ' + Number(o.discount.value).toLocaleString()) + '</span> <span style="font-size:11px;color:#888">(' + (o.discount.reason || '') + ')</span></p>' : '') + '<p><strong style="font-size:16px">Total:</strong> <strong style="color:var(--primary);font-size:18px">KSh ' + Number(t.total || 0).toLocaleString() + '</strong></p></div>' +

        '<div class="detail-section"><h4>Timeline</h4><p><strong>Created:</strong> ' + (o.createdAt ? new Date(o.createdAt).toLocaleString('en-KE') : '') + '</p><p><strong>Updated:</strong> ' + (o.updatedAt ? new Date(o.updatedAt).toLocaleString('en-KE') : '') + '</p></div>' +

      '</div>' +

      '<div class="status-update"><strong style="font-size:13px">Update Status:</strong> <select id="statusSelect">' + selHtml + '</select> <button class="btn btn-primary" onclick="updateOrderStatus(\'' + (o.id || id) + '\')" style="font-size:12px">Update</button> <button class="btn btn-secondary" onclick="giveDiscount(\'' + (o.id || id) + '\')" style="font-size:12px;background:#fff3e0;color:#e65100;border:1px solid #e65100">🎁 Discount</button> <button class="btn" onclick="document.getElementById(\'orderDetail\').classList.remove(\'active\')" style="font-size:12px">Close</button></div>';

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
async function giveDiscount(orderId) {
  var type = prompt('Discount type? Enter "%" for percentage or "KSh" for fixed amount:', '%');
  if (type === null) return;
  var isPercent = type.trim() === '%';
  var val = prompt('Discount value' + (isPercent ? ' (e.g., 10 for 10% off):' : ' (e.g., 500 for KSh 500 off):'));
  if (val === null) return;
  var numVal = parseFloat(val);
  if (isNaN(numVal) || numVal <= 0) { alert('Invalid value'); return; }
  var reason = prompt('Reason for discount (optional):', '');
  if (reason === null) return;
  try {
    var r = await fetch(API + '/order?id=' + orderId, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        discount: {
          type: isPercent ? 'percentage' : 'fixed',
          value: numVal,
          reason: reason.trim() || 'Admin discount'
        }
      })
    });
    var d = await r.json();
    if (d.success) {
      loadOrders();
      showOrderDetail(orderId);
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

    allProducts = d.products || [];

    renderProducts();
    loadCategories();

  } catch(e) {

    document.getElementById('productList').innerHTML = '<div class="error">Connection error</div>';

  }

}

async function loadCategories() {
  try {
    var r = await fetch(API + '/products?all=true');
    var d = await r.json();
    if (!d.success || !d.products) return;
    var cats = [];
    for (var i = 0; i < d.products.length; i++) {
      var c = d.products[i].category;
      if (c && cats.indexOf(c) === -1) cats.push(c);
    }
    cats.sort();
    allCategories = cats;

    // Populate filter dropdown
    var filter = document.getElementById('prodCategoryFilter');
    var currVal = filter.value;
    filter.innerHTML = '<option value="">All Categories</option><option value="__lowstock__">\u26a0 Low Stock (< 20)</option>';
    for (var j = 0; j < cats.length; j++) {
      var opt = document.createElement('option');
      opt.value = cats[j];
      opt.textContent = cats[j];
      filter.appendChild(opt);
    }
    filter.value = currVal;

    // Populate add/edit form dropdown
    var formCat = document.getElementById('prodCategory');
    var currFormVal = formCat.value;
    formCat.innerHTML = '';
    for (var k = 0; k < cats.length; k++) {
      var opt2 = document.createElement('option');
      opt2.value = cats[k];
      opt2.textContent = cats[k];
      formCat.appendChild(opt2);
    }
    formCat.value = currFormVal;

    // Render category management
    renderCategories();
  } catch(e) {
    console.error('Failed to load categories:', e);
  }
}

var allCategories = [];

function renderCategories() {
  var el = document.getElementById('categoryList');
  if (!el) return;
  var html = '';
  for (var i = 0; i < allCategories.length; i++) {
    var c = allCategories[i];
    var count = 0;
    for (var j = 0; j < allProducts.length; j++) {
      if (allProducts[j].category === c) count++;
    }
    html += '<div class="cat-row" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border:1px solid #eee;border-radius:8px;margin-bottom:6px;">' +
      '<div><strong>' + c + '</strong> <span style="color:#888;font-size:12px;">(' + count + ' products)</span></div>' +
      '<div>' +
        (count === 0
          ? '<button onclick="deleteCategory(\'' + c.replace(/'/g, "\\'") + '\')" style="padding:4px 12px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:4px;cursor:pointer;font-size:12px;">Delete</button>'
          : '<span style="font-size:11px;color:#999;">Has ' + count + ' product(s)</span>') +
      '</div></div>';
  }
  el.innerHTML = html;
}

function addCategory() {
  // Show inline modal instead of browser prompt()
  var overlay = document.createElement('div');
  overlay.id = 'cat-prompt-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.4);z-index:99999;display:flex;align-items:center;justify-content:center';
  overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = '<div style="background:#fff;border-radius:12px;padding:24px;width:360px;max-width:90vw;box-shadow:0 10px 40px rgba(0,0,0,0.15)" onclick="event.stopPropagation()">' +
    '<h3 style="margin:0 0 6px;color:var(--primary);font-size:17px">+ New Category</h3>' +
    '<p style="margin:0 0 14px;color:#888;font-size:13px">Enter a name for the new product category.</p>' +
    '<input type="text" id="cat-prompt-input" placeholder="e.g. Eye Care" style="width:100%;padding:10px 14px;border:2px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:14px;box-sizing:border-box;outline:none">' +
    '<div style="display:flex;gap:10px">' +
      '<button onclick="document.getElementById(\'cat-prompt-overlay\').remove()" style="flex:1;padding:10px;background:#f5f5f5;color:#666;border:1px solid #ddd;border-radius:8px;cursor:pointer;font-size:14px">Cancel</button>' +
      '<button onclick="doAddCategory()" style="flex:2;padding:10px;background:var(--primary);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600">Add Category</button>' +
    '</div></div>';
  document.body.appendChild(overlay);
  setTimeout(function() {
    var inp = document.getElementById('cat-prompt-input');
    if (inp) { inp.focus(); inp.addEventListener('keydown', function(ev) { if (ev.key === 'Enter') doAddCategory(); }); }
  }, 100);
}

function doAddCategory() {
  var input = document.getElementById('cat-prompt-input');
  if (!input) return;
  var name = input.value.trim();
  if (!name) { input.style.borderColor = '#c62828'; input.focus(); return; }
  input.style.borderColor = '#ddd';
  var overlay = document.getElementById('cat-prompt-overlay');
  if (overlay) overlay.remove();
  if (allCategories.indexOf(name) >= 0) {
    alert('Category "' + name + '" already exists.');
    return;
  }
  allCategories.push(name);
  allCategories.sort();
  // Update both dropdowns directly (don't call loadCategories - it re-fetches from products and overwrites)
  var filter = document.getElementById('prodCategoryFilter');
  if (filter) {
    var currVal = filter.value;
    filter.innerHTML = '<option value="">All Categories</option><option value="__lowstock__">\u26a0 Low Stock (< 20)</option>';
    for (var j = 0; j < allCategories.length; j++) {
      var opt = document.createElement('option');
      opt.value = allCategories[j];
      opt.textContent = allCategories[j];
      filter.appendChild(opt);
    }
    filter.value = currVal;
  }
  var formCat = document.getElementById('prodCategory');
  if (formCat) {
    var currFormVal = formCat.value;
    formCat.innerHTML = '';
    for (var k = 0; k < allCategories.length; k++) {
      var opt2 = document.createElement('option');
      opt2.value = allCategories[k];
      opt2.textContent = allCategories[k];
      formCat.appendChild(opt2);
    }
    formCat.value = currFormVal;
  }
  renderCategories();
}

async function deleteCategory(name) {
  if (!confirm('Delete category \"' + name + '\"? This cannot be undone.')) return;
  var idx = allCategories.indexOf(name);
  if (idx >= 0) allCategories.splice(idx, 1);
  loadCategories();
}



function renderProducts() {

  var el = document.getElementById('productList');

  if (allProducts.length === 0) {

    el.innerHTML = '<div style="padding:60px;text-align:center;color:#999">No products found. Click "+ Add Product" to get started.</div>';

    document.getElementById('inventorySummary').style.display = 'none';

    return;

  }

  var html = '';

  var totalStock = 0;

  var lowStock = 0;

  var lowStockItems = [];

  var categories = {};

  var totalValue = 0;

  // Sort alphabetically by name
  var sorted = allProducts.slice().sort(function(a, b) {
    var na = (a.name || "").toLowerCase();
    var nb = (b.name || "").toLowerCase();
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  });

  for (var i = 0; i < sorted.length; i++) {

    var p = sorted[i];

    totalStock += (p.stock || 0);

    totalValue += (p.price || 0) * (p.stock || 0);

    if (p.stock !== undefined && p.stock < 20) { lowStock++; lowStockItems.push(p.name + ' (' + p.stock + ')'); }

    if (!categories[p.category]) categories[p.category] = 0;

    categories[p.category]++;

    var stockClass = p.stock < 5 ? 'stock-critical' : p.stock < 20 ? 'stock-low' : 'stock-ok';
    if (p.stock <= 0) stockClass = 'stock-out';

    var stockLabel = '';
    if (p.stock <= 0) {
      stockLabel = '❌ Out of Stock';
    } else if (p.stock < 5) {
      stockLabel = '❌ Critical (' + p.stock + ')';
    } else if (p.stock < 20) {
      stockLabel = '⚠ Low Stock (' + p.stock + ')';
    } else {
      stockLabel = 'In Stock (' + p.stock + ')';
    }

    var thumb = p.image
      ? '<div class="prod-thumb"><img src="' + p.image + '" alt="' + p.name.replace(/'/g, "\\u0027") + '" onerror="this.innerHTML=\'<span class=no-img>\U0001f4e6</span>\'"></div>'
      : '<div class="prod-thumb"><span class="no-img">\U0001f4e6</span></div>';

    var desc = p.description
      ? '<div class="prod-desc">' + p.description.substring(0,80) + (p.description.length > 80 ? '...' : '') + '</div>'
      : '';

    var featureBtn = p.featured
      ? '<button class="pa-btn pa-feat active" onclick="toggleFeatured(\'' + p.id + '\',false)">\u2b50 Featured</button>'
      : '<button class="pa-btn pa-feat" onclick="toggleFeatured(\'' + p.id + '\',true)">\u2b50 Feature</button>';

    var saleBtn = p.specialOffer
      ? '<button class="pa-btn pa-sale active" onclick="toggleSpecial(\'' + p.id + '\',false)">\U0001f525 On Sale</button>'
      : '<button class="pa-btn pa-sale" onclick="toggleSpecial(\'' + p.id + '\',true)">\U0001f525 Offer</button>';

    html += '<div class="product-card">' +

      thumb +

      '<div class="prod-info">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat"><span class="cat-badge">' + (p.category || 'General') + '</span> ' + p.id + '</div>' +
        desc +
      '</div>' +

      '<div class="prod-stock-section">' +
        '<div class="prod-price">KSh ' + Number(p.price).toLocaleString() + '</div>' +
        '<div class="prod-stock-badge ' + stockClass + '">' + stockLabel + 
          '<span class="stock-inline-btns">' +
            '<button onclick="event.stopPropagation();adjustStock(\'' + p.id + '\',-1)" title="Decrease by 1">[-]</button>' +
            '<button onclick="event.stopPropagation();adjustStock(\'' + p.id + '\',1)" title="Increase by 1">[+]</button>' +
          '</span>' +
        '</div>' +
        '<div class="stock-btns">' +
          '<button class="sb sb--" onclick="quickStock(\'' + p.id + '\',-1)" title="Remove 1">-1</button>' +
          '<button class="sb sb--" onclick="quickStock(\'' + p.id + '\',-5)" title="Remove 5">-5</button>' +
          '<button class="sb sb+" onclick="quickStock(\'' + p.id + '\',1)" title="Add 1">+1</button>' +
          '<button class="sb sb+" onclick="quickStock(\'' + p.id + '\',5)" title="Add 5">+5</button>' +
        '</div>' +
      '</div>' +

      '<div class="prod-actions">' +
        '<button class="pa-btn pa-edit" onclick="showEditProduct(\'' + p.id + '\')">Edit</button>' +
        '<button class=\"pa-btn\" onclick=\"showStockHistory(\'' + p.id + '\')\" title=\"Stock History\" style=\"font-size:16px;padding:4px 8px;background:#f3e5f5;color:#6a1b9a;border:1px solid #ce93d8;border-radius:4px;cursor:pointer\">📋</button>' +
        featureBtn +
        saleBtn +
        '<button class="pa-btn pa-del" onclick="deleteProduct(\'' + p.id + '\',\'' + p.name.replace(/'/g,"\\'") + '\')" title="Delete product">Del</button>' +
      '</div>' +

    '</div>';

  }

  el.innerHTML = html;

  

  // Inventory summary

  var catCount = Object.keys(categories).length;

  var elSum = document.getElementById('inventorySummary');

  elSum.style.display = 'block';

  var lowHtml = '';

  if (lowStockItems.length > 0) {

    lowHtml = '<div style="margin-top:10px;font-size:12px;line-height:1.6;background:#fff8e1;padding:10px 14px;border-radius:8px;border:1px solid #ffe082">' +

      '<strong style="color:#e65100">\u26a0\ufe0f Low Stock Alert:</strong> ' +

      lowStockItems.join(' &nbsp;\u2022&nbsp; ') +

    '</div>';

  }

  elSum.innerHTML =

    '<div style="margin-bottom:8px;font-size:14px;font-weight:700;color:#333">\U0001f4ca Inventory Overview</div>' +

    '<div class="inv-stats">' +

      '<div class="inv-stat-card stat-total"><div class="stat-num">' + sorted.length + '</div><div class="stat-label">Total Products</div></div>' +

      '<div class="inv-stat-card stat-total"><div class="stat-num">' + catCount + '</div><div class="stat-label">Categories</div></div>' +

      '<div class="inv-stat-card stat-ok"><div class="stat-num">' + totalStock + '</div><div class="stat-label">Total Units</div></div>' +

      '<div class="inv-stat-card stat-ok"><div class="stat-num">KSh ' + totalValue.toLocaleString() + '</div><div class="stat-label">Stock Value</div></div>' +

      '<div class="inv-stat-card ' + (lowStock > 0 ? 'stat-warn' : 'stat-ok') + '"><div class="stat-num">' + lowStock + '</div><div class="stat-label">Low Stock Items</div></div>' +

      '<div class="inv-stat-card stat-ok"><div class="stat-num">' + (allProducts.length - lowStock) + '</div><div class="stat-label">Healthy Stock</div></div>' +

    '</div>' +

    lowHtml;

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



async function toggleFeatured(id, value) {
  try {
    var r = await fetch(API + "/products?id=" + id, {method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({featured:value})});
    var d = await r.json();
    if (d.success) { loadProducts(); }
  } catch(e) { alert("Error: " + e.message); }
}

async function toggleSpecial(id, value) {
  try {
    var r = await fetch(API + "/products?id=" + id, {method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({specialOffer:value})});
    var d = await r.json();
    if (d.success) { loadProducts(); }
  } catch(e) { alert("Error: " + e.message); }
}

/** adjustStock(id, change) — inline stock adjustment without prompt */
window.adjustStock = async function adjustStock(productId, change) {
  try {
    var reason = change > 0 ? 'Manual addition (admin)' : 'Manual reduction (admin)';
    var r = await fetch(API + '/products?id=' + productId + '&action=stock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('obwochas_admin_token') },
      body: JSON.stringify({ change: change, reason: reason })
    });
    var d = await r.json();
    if (d.success) {
      loadProducts();
    } else {
      alert('Error: ' + (d.error || 'Unknown'));
    }
  } catch(e) {
    alert('Error adjusting stock: ' + e.message);
  }
};

async function quickStock(id, change) {

  var reason = prompt('Stock change: ' + (change > 0 ? '+' : '') + change + ' units. Reason:', '');

  if (reason === null) return;

  if (reason.trim() === '') reason = 'Quick stock ' + (change > 0 ? 'addition' : 'removal');

  var btn = event && event.target ? event.target : null;

  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  fetch(API + '/products?id=' + id + '&action=stock', {

    method: 'PATCH',

    headers: { 'Content-Type': 'application/json' },

    body: JSON.stringify({ change: change, reason: reason.trim() })

  })

  .then(function(r){ return r.json(); })

  .then(function(res){

    if (res.success) {

      loadProducts();

    } else {

      alert('Stock error: ' + (res.error || 'Unknown'));

      if (btn) { btn.disabled = false; btn.textContent = change > 0 ? '+' + change : '' + change; }

    }

  })

  .catch(function(e){

    alert('Connection error: ' + e.message);

    if (btn) { btn.disabled = false; btn.textContent = change > 0 ? '+' + change : '' + change; }

  });

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



async function showStockHistory(id) {
  try {
    var r = await fetch(window.API + '/products?id=' + id);
    var d = await r.json();
    if (!d.success || !d.product) {
      alert('Product not found');
      return;
    }
    var p = d.product;
    var history = p.stockHistory || [];
    var name = p.name || 'Product';
    var currentStock = p.stock || 0;

    var html = '<div class="modal-content" style="max-width:700px">' +
      '<span class="close" onclick="document.getElementById(\'stockHistoryModal\').classList.remove(\'open\')">&times;</span>' +
      '<h2 style="margin-bottom:4px">📦 ' + name + '</h2>' +
      '<p style="color:#666;margin-bottom:16px">Current stock: <strong>' + currentStock + ' units</strong></p>';

    if (history.length === 0) {
      html += '<p style="color:#999;padding:40px;text-align:center">No stock change history yet.</p>';
    } else {
      html += '<table style="width:100%;border-collapse:collapse;font-size:13px">' +
        '<thead><tr style="background:#f5f5f5">' +
          '<th style="padding:8px 10px;text-align:left;border-bottom:2px solid #ddd">Date</th>' +
          '<th style="padding:8px 10px;text-align:center;border-bottom:2px solid #ddd">Change</th>' +
          '<th style="padding:8px 10px;text-align:center;border-bottom:2px solid #ddd">From → To</th>' +
          '<th style="padding:8px 10px;text-align:left;border-bottom:2px solid #ddd">Reason</th>' +
        '</tr></thead><tbody>' +
        history.slice().reverse().map(function(e) {
          var changeClass = e.change > 0 ? 'color:#2e7d32' : 'color:#c62828';
          var sign = e.change > 0 ? '+' : '';
          return '<tr>' +
            '<td style="padding:8px 10px;border-bottom:1px solid #f0f0f0">' + new Date(e.date).toLocaleString() + '</td>' +
            '<td style="padding:8px 10px;text-align:center;border-bottom:1px solid #f0f0f0;font-weight:700;' + changeClass + '">' + sign + e.change + '</td>' +
            '<td style="padding:8px 10px;text-align:center;border-bottom:1px solid #f0f0f0">' + e.from + ' → ' + e.to + '</td>' +
            '<td style="padding:8px 10px;border-bottom:1px solid #f0f0f0;color:#666">' + e.reason + '</td>' +
          '</tr>';
        }).join('') +
        '</tbody></table>';
    }

    html += '<div style="text-align:right;margin-top:16px">' +
      '<button onclick="document.getElementById(\'stockHistoryModal\').classList.remove(\'open\')" style="padding:8px 20px;border:1px solid #ddd;border-radius:6px;background:#fff;cursor:pointer">Close</button>' +
      '</div></div>';

    document.getElementById('stockHistoryModal').innerHTML = html;
    document.getElementById('stockHistoryModal').classList.add('open');
  } catch(e) {
    alert('Error loading history: ' + e.message);
  }
}

// Auto-refresh is handled by initDashboard() after auth check


/* ========= REVIEWS (Admin) ========= */

let reviewFilter = 'pending';

function setReviewFilter(val) {
  reviewFilter = val;
  loadAdminReviews();
}

async function loadAdminReviews() {
  var list = document.getElementById('reviewList');
  if (!list) return;
  list.innerHTML = '<div style="text-align:center;padding:40px;color:#999">Loading reviews...</div>';

  try {
    var r = await fetch(API + '/reviews?all=true');
    var d = await r.json();
    if (!d.success) {
      list.innerHTML = '<div class="error" style="padding:40px;text-align:center;color:#c62828">' + (d.error || 'Failed to load') + '</div>';
      return;
    }

    var filterEl = document.getElementById('reviewFilter');
    var filterVal = filterEl ? filterEl.value : 'pending';

    var reviews = d.reviews || [];
    if (filterVal === 'pending') reviews = reviews.filter(function(r) { return !r.approved; });
    else if (filterVal === 'approved') reviews = reviews.filter(function(r) { return r.approved; });

    if (reviews.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:60px 20px;color:#999">' +
        (filterVal === 'pending' ? '🎉 No pending reviews. All caught up!' :
         filterVal === 'approved' ? 'No approved reviews yet.' : 'No reviews yet.') +
        '</div>';
      return;
    }

    var html = '';
    for (var i = 0; i < reviews.length; i++) {
      var rev = reviews[i];
      var stars = '';
      for (var s = 1; s <= 5; s++) {
        stars += s <= (rev.rating || 5) ? '<span style="color:#f5a623;font-size:16px">★</span>' : '<span style="color:#e0e0e0;font-size:16px">★</span>';
      }
      var dateStr = rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() + ' ' + new Date(rev.createdAt).toLocaleTimeString() : '';
      var approvedClass = rev.approved ? 'status-confirmed' : 'status-pending';
      var approvedText = rev.approved ? 'Approved' : 'Pending';

      html += '<div class="order-card" style="flex-wrap:wrap;gap:10px">' +
        '<div style="flex:1;min-width:250px">' +
        '<div style="margin-bottom:6px">' + stars + '</div>' +
        '<div style="font-weight:700;color:#333;margin-bottom:2px">' + rev.name + '</div>' +
        '<div style="font-size:12px;color:#666;margin-bottom:6px">' + (rev.location ? rev.location + ' · ' : '') + dateStr + '</div>' +
        '<p style="margin:0;font-size:14px;color:#444;line-height:1.5">"' + rev.comment + '"</p>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:100px">' +
        '<span class="status-badge ' + approvedClass + '">' + approvedText + '</span>' +
        '<div style="display:flex;gap:6px">';

      if (!rev.approved) {
        html += '<button onclick="approveReview(\'' + (rev._id || rev.id) + '\')" title="Approve" style="padding:4px 12px;background:#2e7d32;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">✅ Approve</button>';
      } else {
        html += '<button onclick="unapproveReview(\'' + (rev._id || rev.id) + '\')" title="Unapprove" style="padding:4px 12px;background:#e65100;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">↩️ Unapprove</button>';
      }
      html += '<button onclick="deleteReview(\'' + (rev._id || rev.id) + '\',\'' + rev.name.replace(/'/g, '\\\'') + '\')" title="Delete" style="padding:4px 12px;background:#c62828;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">🗑️ Delete</button>' +
        '</div></div></div>';
    }
    list.innerHTML = html;
  } catch(e) {
    list.innerHTML = '<div class="error" style="padding:40px;text-align:center;color:#c62828">Error: ' + e.message + '</div>';
  }
}

async function approveReview(id) {
  try {
    var r = await fetch(API + '/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id, approved: true })
    });
    var d = await r.json();
    if (d.success) {
      loadAdminReviews();
    } else {
      alert('Error: ' + d.error);
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

async function unapproveReview(id) {
  try {
    var r = await fetch(API + '/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId: id, approved: false })
    });
    var d = await r.json();
    if (d.success) {
      loadAdminReviews();
    } else {
      alert('Error: ' + d.error);
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

async function deleteReview(id, name) {
  if (!confirm('Delete review from "' + name + '" permanently?')) return;
  try {
    var r = await fetch(API + '/reviews?id=' + id, { method: 'DELETE' });
    var d = await r.json();
    if (d.success) {
      loadAdminReviews();
    } else {
      alert('Error: ' + d.error);
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

/* ========= NOTIFICATIONS ========= */

async function updateNotifBadge() {
  try {
    var r = await fetch(API + '/orders?notifications=1&unread=true&limit=1');
    var d = await r.json();
    if (d.success) {
      var badge = document.getElementById('notifBadge');
      var count = document.getElementById('notifCount');
      if (d.unreadCount > 0) {
        badge.textContent = d.unreadCount;
        badge.style.display = 'inline';
        count.textContent = '(' + d.unreadCount + ')';
        count.style.color = '#ff4444';
        count.style.fontSize = '11px';
      } else {
        badge.style.display = 'none';
        count.textContent = '';
      }
    }
  } catch(e) { /* silent */ }
}

async function loadNotifications() {
  try {
    var r = await fetch(API + '/orders?notifications=1');
    var d = await r.json();
    var list = document.getElementById('notifList');
    if (!d.success) {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#c62828">Error: ' + (d.error || 'Failed to load') + '</div>';
      return;
    }
    if (!d.notifications || !d.notifications.length) {
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#999"><div style="font-size:48px;margin-bottom:16px">🔔</div><p>No notifications yet. New orders and status changes will appear here.</p></div>';
      updateNotifBadge();
      return;
    }
    var html = '';
    d.notifications.forEach(function(n) {
      var timeAgo = '';
      if (n.createdAt) {
        var diff = Date.now() - new Date(n.createdAt).getTime();
        var mins = Math.floor(diff / 60000);
        if (mins < 1) timeAgo = 'Just now';
        else if (mins < 60) timeAgo = mins + 'm ago';
        else if (mins < 1440) timeAgo = Math.floor(mins / 60) + 'h ago';
        else timeAgo = Math.floor(mins / 1440) + 'd ago';
      }
      var typeIcon = n.type === 'order_created' ? '🆕' : n.type === 'order_updated' ? '🔄' : '💬';
      html += '<div style="display:flex;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid #f0f0f0;' + (n.read ? '' : 'background:#f0faf3') + '">' +
        '<span style="font-size:20px">' + typeIcon + '</span>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-weight:' + (n.read ? '400' : '600') + ';font-size:14px;color:#333">' + n.title + '</div>' +
          '<div style="font-size:12px;color:#888;margin-top:2px">' + n.message + '</div>' +
          '<div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:#aaa">' +
            '<span>' + timeAgo + '</span>' +
            (n.customer ? '<span>👤 ' + n.customer + '</span>' : '') +
            (n.orderId ? '<span onclick="trackOrderNotif(\'' + n.orderId + '\')" style="color:#2e7d32;cursor:pointer;text-decoration:underline">📦 ' + n.orderId.substring(0,12) + '</span>' : '') +
          '</div>' +
        '</div>' +
        (!n.read ? '<span style="width:8px;height:8px;background:#2e7d32;border-radius:50%;flex-shrink:0;margin-top:6px" onclick="markNotifRead(\'' + (n.id || '') + '\')" title="Mark as read"></span>' : '') +
      '</div>';
    });
    list.innerHTML = html;
    updateNotifBadge();
  } catch(e) {
    document.getElementById('notifList').innerHTML = '<div style="text-align:center;padding:40px;color:#c62828">Connection error. Retry.</div>';
  }
}

async function markNotifRead(id) {
  try {
    await fetch(API + '/orders?notifications=1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: id })
    });
    loadNotifications();
  } catch(e) { /* silent */ }
}

async function markAllNotifsRead() {
  try {
    await fetch(API + '/orders?notifications=1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true })
    });
    loadNotifications();
  } catch(e) { /* silent */ }
}

function trackOrderNotif(orderId) {
  switchTab('orders');
  document.getElementById('orderSearch').value = orderId;
  searchOrders();
}

