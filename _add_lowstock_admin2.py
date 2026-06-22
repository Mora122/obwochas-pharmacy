"""Add low stock alert banner to admin dashboard."""
with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'r', encoding='utf-8') as f:
    text = f.read()

if 'checkLowStock' in text:
    print('Already has low stock alerts.')
    exit(0)

# 1. CSS is already added from previous attempt
if 'low-stock-banner' not in text:
    css = '''
.low-stock-banner{margin:12px 16px;padding:12px 16px;border-radius:10px;background:#fff3e0;border:1px solid #ffb300;display:none}
.low-stock-banner h4{margin:0 0 8px 0;color:#e65100;font-size:15px}
.low-stock-banner ul{margin:0;padding:0 0 0 20px}
.low-stock-banner li{margin:4px 0;font-size:13px;color:#555}
.low-stock-banner .close-banner{float:right;background:none;border:none;font-size:20px;cursor:pointer;color:#e65100;line-height:1}'''
    text = text.replace('</style>', css + '\n</style>', 1)
    print('1. Added CSS')
else:
    print('1. CSS already present')

# 2. Add banner HTML if not there
if 'lowStockBanner' not in text:
    banner = '''<div id="lowStockBanner" class="low-stock-banner">
  <button class="close-banner" onclick="this.parentElement.style.display='none'">&times;</button>
  <h4>⚠️ Low Stock Alert</h4>
  <ul id="lowStockList"></ul>
</div>'''
    insert_marker = 'id="tab-dashboard" class="tab-content">\n  <div class="admin-container">'
    if insert_marker in text:
        text = text.replace(insert_marker, insert_marker + '\n' + banner, 1)
        print('2. Added banner HTML')
    else:
        print('2. ERROR: marker not found')
        exit(1)
else:
    print('2. Banner already present')

# 3. Add JS function - insert before loadDashboard
if 'checkLowStock' not in text:
    js_func = '''
  function checkLowStock() {
    var threshold = 10;
    fetch('/api/products').then(function(r){return r.json();}).then(function(prods){
      var low=prods.filter(function(p){return p.stock!==undefined&&p.stock>0&&p.stock<=threshold;});
      var out=prods.filter(function(p){return p.stock!==undefined&&p.stock===0;});
      var list=document.getElementById('lowStockList');
      if(!list)return;
      var h='';
      if(low.length>0){h+='<li><strong>'+low.length+' product(s) running low:</strong></li>';low.forEach(function(p){h+='<li>'+p.name+' <span style=\"color:#e65100;font-weight:600\">('+p.stock+' left)</span></li>';});}
      if(out.length>0){h+='<li><strong>'+out.length+' product(s) out of stock:</strong></li>';out.forEach(function(p){h+='<li>'+p.name+' <span style=\"color:#c62828;font-weight:600\">(Out of stock)</span></li>';});}
      list.innerHTML=h;
      var bn=document.getElementById('lowStockBanner');
      if(bn)bn.style.display=(low.length+out.length>0)?'block':'none';
    }).catch(function(e){console.log('Low stock check failed:',e);});
  }'''
    
    text = text.replace('function loadDashboard()', js_func + '\n\n  function loadDashboard()', 1)
    print('3. Added JS function')
else:
    print('3. JS function already present')

# 4. Hook into loadDashboard
if 'checkLowStock();' not in text:
    # Call after loadProducts() within loadDashboard
    text = text.replace('loadProducts();', 'loadProducts();\n    setTimeout(checkLowStock, 500);', 1)
    print('4. Hooked checkLowStock')
else:
    print('4. Already hooked')

with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('\nDone!')
