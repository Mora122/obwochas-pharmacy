import re

# ===== 1. Fix shop.html: conditional Add to Cart button =====
t = open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\shop.html', 'r', encoding='utf-8').read()

# Find the product actions rendering section - looking for the addToCart button
old_marker = 'class="btn btn-primary btn-sm" onclick="addToCart'
idx = t.find(old_marker)
if idx > 0:
    # Find the full line/context
    start = t.rfind('+', 0, idx)
    if start < 0: start = idx - 200
    end = t.find('</div></div></div>', idx)
    if end < 0: end = idx + 200
    else: end = end + 19
    
    snippet = t[start:end]
    print(f'Found button region ({start}:{end}):')
    print(snippet[:300])
    print('...')
    
    # Replace the whole actions block
    old_actions = '''<a href="product.html?id=' + p.id + '" class="btn btn-sm">View</a>' +
            '<button class="btn btn-primary btn-sm" onclick="addToCart(\'' + p.id + '\',\'' + p.name.replace(/'/g,"\\\\\'") + '\',' + p.price + ",'" + (p.image||'').replace(/'/g,"\\\\\'") + "')\">Add to Cart</button></div></div></div>\""
    
    new_actions = '''<a href="product.html?id=' + p.id + '" class="btn btn-sm">View</a>' +
            '(p.stock > 0 ? \'<button class="btn btn-primary btn-sm" onclick="addToCart(\\\'\' + p.id + \'\\\',\\\'\' + p.name.replace(/\'/g,"\\\\\'") + \'\\\',\' + p.price + ",\\\'" + (p.image||\'\').replace(/\'/g,"\\\\\'") + \'\\\')\">Add to Cart</button>\' : \'<button class="btn btn-sm" disabled style="background:#eee;color:#999;cursor:not-allowed">Out of Stock</button>\') + \'</div></div></div>\";'
    
    if old_actions in t:
        t = t.replace(old_actions, new_actions)
        open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\shop.html', 'w', encoding='utf-8').write(t)
        print('✅ shop.html: Out of Stock hides Add to Cart button')
    else:
        print('❌ Pattern mismatch - checking exact text...')
        # Let me extract exactly what's there
        print(repr(t[idx:idx+200]))
else:
    print('❌ Could not find addToCart button')

# ===== 2. Add low stock alert to admin dashboard =====
a = open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'r', encoding='utf-8').read()

# Check if low stock alert already exists
if 'low-stock-alert' in a or 'lowStock' in a:
    print('✅ admin.html already has low stock alerts')
else:
    # Add low stock CSS
    css_needed = '''/* Low stock alert */
.low-stock-banner{margin:12px 0;padding:12px 16px;border-radius:10px;background:#fff3e0;border:1px solid #ffb300;display:none}
.low-stock-banner h4{margin:0 0 8px 0;color:#e65100}
.low-stock-banner ul{margin:0;padding:0 0 0 20px}
.low-stock-banner li{margin:4px 0;font-size:13px;color:#555}
.low-stock-banner .close-banner{float:right;background:none;border:none;font-size:18px;cursor:pointer;color:#e65100}'''
    
    # Insert CSS before last </style>
    if '</style>' in a:
        a = a.replace('</style>', css_needed + '\n</style>', 1)
        print('✅ Added low stock CSS to admin.html')
    
    # Add banner HTML before dashboard stats
    banner_html = '''<div id="lowStockBanner" class="low-stock-banner">
  <button class="close-banner" onclick="this.parentElement.style.display='none'">&times;</button>
  <h4>⚠️ Low Stock Alert</h4>
  <ul id="lowStockList"></ul>
</div>'''
    stats_marker = '<div class="stats-grid"'
    if stats_marker in a:
        a = a.replace(stats_marker, banner_html + '\n<div class="stats-grid"', 1)
        print('✅ Added low stock banner to admin dashboard')
    
    # Add JS to populate low stock alert
    js_needed = '''
  // Low stock alert checker - run after loadProducts
  function checkLowStock() {
    var threshold = 10;
    fetch('/api/products')
      .then(r => r.json())
      .then(prods => {
        var low = prods.filter(function(p) { return p.stock !== undefined && p.stock > 0 && p.stock <= threshold; });
        var out = prods.filter(function(p) { return p.stock !== undefined && p.stock === 0; });
        var list = document.getElementById('lowStockList');
        if (!list) return;
        var html = '';
        if (low.length > 0) {
          html += '<li><strong>' + low.length + ' products low on stock:</strong></li>';
          low.slice(0, 10).forEach(function(p) {
            html += '<li>' + p.name + ' <span style="color:#e65100;font-weight:600">(' + p.stock + ' left)</span></li>';
          });
        }
        if (out.length > 0) {
          html += '<li><strong>' + out.length + ' products out of stock:</strong></li>';
          out.slice(0, 5).forEach(function(p) {
            html += '<li>' + p.name + ' <span style="color:#c62828;font-weight:600">(Out of stock)</span></li>';
          });
        }
        list.innerHTML = html;
        document.getElementById('lowStockBanner').style.display = (low.length + out.length > 0) ? 'block' : 'none';
      })
      .catch(function(e) { console.log('Low stock check failed:', e); });
  }'''
    
    # Find a good place to insert the JS function (near other functions)
    # Look for loadProducts or switchTab
    if 'loadProducts' in a:
        a = a.replace('function loadProducts', js_needed + '\n  function loadProducts', 1)
        print('✅ Added checkLowStock() JS function')
    
    # Hook into loadProducts and loadDashboardStats
    # After loadProducts() finishes, call checkLowStock()
    old_call = '''  loadProducts();'''
    new_call = '''  loadProducts();
  setTimeout(checkLowStock, 500);'''
    if old_call in a:
        a = a.replace(old_call, new_call, 1)
        print('✅ Hooking checkLowStock into page load')
    
    open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'w', encoding='utf-8').write(a)
    print('✅ admin.html saved')

print()
print('Done with inventory improvements')
