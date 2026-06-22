"""Add low stock alert banner to admin dashboard."""
with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'r', encoding='utf-8') as f:
    text = f.read()

if 'checkLowStock' in text:
    print('Already has low stock alerts, nothing to do.')
    exit(0)

# 1. Add CSS (before last </style>)
css = '''
.low-stock-banner{margin:12px 16px;padding:12px 16px;border-radius:10px;background:#fff3e0;border:1px solid #ffb300;display:none}
.low-stock-banner h4{margin:0 0 8px 0;color:#e65100;font-size:15px}
.low-stock-banner ul{margin:0;padding:0 0 0 20px}
.low-stock-banner li{margin:4px 0;font-size:13px;color:#555}
.low-stock-banner .close-banner{float:right;background:none;border:none;font-size:20px;cursor:pointer;color:#e65100;line-height:1}'''

text = text.replace('</style>', css + '\n</style>', 1)
print('1. Added CSS')

# 2. Add banner HTML right after tab-dashboard opens  
banner = '''<div id="lowStockBanner" class="low-stock-banner">
  <button class="close-banner" onclick="this.parentElement.style.display='none'">&times;</button>
  <h4>\u26a0\ufe0f Low Stock Alert</h4>
  <ul id="lowStockList"></ul>
</div>'''

insert_marker = 'id="tab-dashboard" class="tab-content">\n  <div class="admin-container">'
text = text.replace(insert_marker, insert_marker + '\n' + banner, 1)
print('2. Added banner HTML')

# 3. Add the checkLowStock JS function
js_func = '''
  function checkLowStock() {
    var threshold = 10;
    fetch('/api/products')
      .then(function(r) { return r.json(); })
      .then(function(prods) {
        var low = prods.filter(function(p) { return p.stock !== undefined && p.stock > 0 && p.stock <= threshold; });
        var out = prods.filter(function(p) { return p.stock !== undefined && p.stock === 0; });
        var list = document.getElementById('lowStockList');
        if (!list) return;
        var html = '';
        if (low.length > 0) {
          html += '<li><strong>' + low.length + ' product(s) running low:</strong></li>';
          low.forEach(function(p) {
            html += '<li>' + p.name + ' <span style="color:#e65100;font-weight:600">(' + p.stock + ' left)</span></li>';
          });
        }
        if (out.length > 0) {
          html += '<li><strong>' + out.length + ' product(s) out of stock:</strong></li>';
          out.forEach(function(p) {
            html += '<li>' + p.name + ' <span style="color:#c62828;font-weight:600">(Out of stock)</span></li>';
          });
        }
        list.innerHTML = html;
        var bn = document.getElementById('lowStockBanner');
        if (bn) bn.style.display = (low.length + out.length > 0) ? 'block' : 'none';
      })
      .catch(function(e) { console.log('Low stock check failed:', e); });
  }'''

text = text.replace('function loadDashboardStats', js_func + '\n\n  function loadDashboardStats', 1)
print('3. Added JS function')

# 4. Hook checkLowStock
text = text.replace('loadDashboardStats();', 'loadDashboardStats();\n    setTimeout(checkLowStock, 500);', 1)
print('4. Hooked into page load')

with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('\nDone! Admin dashboard now has low stock alerts.')
