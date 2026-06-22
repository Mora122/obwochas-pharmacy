#!/usr/bin/env python3
"""
Inject Admin Dashboard + Users tabs into admin.html
"""
import os

PATH = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html'

with open(PATH, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Tab buttons: Add Dashboard first, Users after Notifications
old_tabs = """<div class="admin-tabs" style="max-width:1200px;margin:20px auto 0;padding:0 20px;display:flex;gap:0;border-bottom:2px solid #ddd">

  <button class="tab-btn active" data-tab="orders" onclick="switchTab('orders')">\U0001f4e6 Orders</button>

  <button class="tab-btn" data-tab="products" onclick="switchTab('products')">\U0001f48a Products</button>

  <button class="tab-btn" data-tab="reviews" onclick="switchTab('reviews')">\u2b50 Reviews</button>

  <button class="tab-btn" data-tab="notifications" onclick="switchTab('notifications');loadNotifications()">\U0001f514 Notifications <span id="notifCount"></span></button>

</div>"""

new_tabs = """<div class="admin-tabs" style="max-width:1200px;margin:20px auto 0;padding:0 20px;display:flex;gap:0;border-bottom:2px solid #ddd">

  <button class="tab-btn active" data-tab="dashboard" onclick="switchTab('dashboard');loadDashboard()">\U0001f4ca Dashboard</button>

  <button class="tab-btn" data-tab="orders" onclick="switchTab('orders')">\U0001f4e6 Orders</button>

  <button class="tab-btn" data-tab="products" onclick="switchTab('products')">\U0001f48a Products</button>

  <button class="tab-btn" data-tab="users" onclick="switchTab('users')">\U0001f465 Users</button>

  <button class="tab-btn" data-tab="reviews" onclick="switchTab('reviews')">\u2b50 Reviews</button>

  <button class="tab-btn" data-tab="notifications" onclick="switchTab('notifications');loadNotifications()">\U0001f514 Notifications <span id="notifCount"></span></button>

</div>"""

html = html.replace(old_tabs, new_tabs)
print("Tab buttons replaced")

# 2. Add Dashboard tab content before Orders tab
old_orders_tab = """<!-- Orders Tab -->

<div id="tab-orders" class="tab-content active">"""

dashboard_content = """<!-- Dashboard Tab -->
<div id="tab-dashboard" class="tab-content">
  <div class="admin-container">
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px" id="statCards">
      <div class="stat-card" style="background:linear-gradient(135deg,#2e7d32,#1b5e20);color:#fff;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:32px;font-weight:700" id="dashRevenue">0</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px">Total Revenue (KSh)</div>
      </div>
      <div class="stat-card" style="background:linear-gradient(135deg,#1565c0,#0d47a1);color:#fff;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:32px;font-weight:700" id="dashOrders">0</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px">Total Orders</div>
      </div>
      <div class="stat-card" style="background:linear-gradient(135deg,#e65100,#bf360c);color:#fff;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:32px;font-weight:700" id="dashProducts">0</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px">Products</div>
      </div>
      <div class="stat-card" style="background:linear-gradient(135deg,#6a1b9a,#4a148c);color:#fff;border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:32px;font-weight:700" id="dashUsers">0</div>
        <div style="font-size:13px;opacity:0.9;margin-top:4px">Customers</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="background:#fff;border-radius:10px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <h3 style="margin:0 0 12px;font-size:15px;color:#333">\U0001f4c8 Revenue (30 Days)</h3>
        <canvas id="revenueChart" style="width:100%;height:200px"></canvas>
      </div>
      <div style="background:#fff;border-radius:10px;padding:16px 20px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
        <h3 style="margin:0 0 12px;font-size:15px;color:#333">\U0001f3c6 Top Products</h3>
        <div id="topProductsList" style="font-size:13px;color:#555"></div>
      </div>
    </div>

    <div style="background:#fff;border-radius:10px;padding:16px 20px;margin-top:16px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
      <h3 style="margin:0 0 12px;font-size:15px;color:#333">\U0001f4e6 Recent Orders</h3>
      <div id="recentOrdersList" style="font-size:13px;color:#555"></div>
    </div>
  </div>
</div>

"""

html = html.replace(old_orders_tab, dashboard_content + old_orders_tab)
print("Dashboard tab content added")

# 3. Add Users tab content before Reviews tab
old_reviews_start = """<!-- Reviews Tab -->"""

users_content = """<!-- Users Tab -->
<div id="tab-users" class="tab-content" style="display:none">
  <div class="admin-container">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <h2 style="margin:0;font-size:20px">\U0001f465 Registered Customers</h2>
      <div class="filters" style="margin:0">
        <input type="text" id="userSearchBox" placeholder="Search by name or email..." style="padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:13px;width:250px" onkeyup="loadUsers()">
        <button class="btn btn-primary" onclick="loadUsers()" style="font-size:12px">\U0001f504 Refresh</button>
      </div>
    </div>
    <div id="userList"><div class="loading">Loading users...</div></div>
  </div>
</div>

"""

html = html.replace(old_reviews_start, users_content + old_reviews_start)
print("Users tab content added")

# 4. Add Dashboard JS functions
# Find the switchTab function and make dashboard the default
old_switch = """function switchTab(tab) {
  var tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(function(t) { t.style.display = 'none'; });
  var btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function(b) { b.classList.remove('active'); });
  var el = document.getElementById('tab-' + tab);
  if (el) el.style.display = 'block';
  var btn = document.querySelector('[data-tab="' + tab + '"]');
  if (btn) btn.classList.add('active');
  if (tab === 'orders') loadOrders();
  if (tab === 'products') loadProducts();
  if (tab === 'reviews') loadAdminReviews();
}"""

new_switch = """function switchTab(tab) {
  var tabs = document.querySelectorAll('.tab-content');
  tabs.forEach(function(t) { t.style.display = 'none'; });
  var btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function(b) { b.classList.remove('active'); });
  var el = document.getElementById('tab-' + tab);
  if (el) el.style.display = 'block';
  var btn = document.querySelector('[data-tab="' + tab + '"]');
  if (btn) btn.classList.add('active');
  if (tab === 'dashboard') loadDashboard();
  if (tab === 'orders') loadOrders();
  if (tab === 'products') loadProducts();
  if (tab === 'users') loadUsers();
  if (tab === 'reviews') loadAdminReviews();
}"""

html = html.replace(old_switch, new_switch)
print("switchTab updated")

# 5. Replace initDashboard to default to dashboard tab
old_init = """function initDashboard() {
  loadOrders();
  setInterval(loadOrders, 60000);
"""

new_init = """function initDashboard() {
  switchTab('dashboard');
  loadOrders();
  setInterval(loadOrders, 60000);
"""

html = html.replace(old_init, new_init)
print("initDashboard updated")

# 6. Add loadDashboard function before the existing search functions
old_search_debounce = """function debounceSearch() {"""

load_dashboard_js = """// Dashboard: load analytics
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
    var r = await fetch('/api/analytics');
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
    var r = await fetch('/api/users' + (search ? '?search=' + encodeURIComponent(search) : ''));
    var d = await r.json();
    if (!d.success) {
      el.innerHTML = '<div style="text-align:center;padding:40px;color:#f44336">Failed to load users. Make sure you\'re signed in as admin.</div>';
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

"""

html = html.replace(old_search_debounce, load_dashboard_js + old_search_debounce)
print("Dashboard + Users JS functions added")

# 7. Fix initDashboard to also load dashboard data
old_init_full = """function initDashboard() {
  switchTab('dashboard');
  loadOrders();
  setInterval(loadOrders, 60000);"""

new_init_full = """function initDashboard() {
  switchTab('dashboard');
  loadDashboard();
  loadOrders();
  setInterval(loadOrders, 60000);"""

# Already updated above

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(html)

print("All changes written to admin.html!")
