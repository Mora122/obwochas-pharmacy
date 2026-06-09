"""Build the inventory management features into admin.html"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# 1. Add "Low Stock" option to the filter dropdown
old_filter = '''<select id="prodCategoryFilter" onchange="loadProducts()">

        <option value="">All Categories</option>

        <option value="Pain Relief">Pain Relief</option>

        <option value="Cold & Flu">Cold & Flu</option>

        <option value="Vitamins & Supplements">Vitamins & Supplements</option>

        <option value="First Aid">First Aid</option>

        <option value="Baby Care">Baby Care</option>

        <option value="Digestive Health">Digestive Health</option>

        <option value="Allergy & Skin Care">Allergy & Skin Care</option>

        <option value="Diabetes Care">Diabetes Care</option>

      </select>'''

new_filter = '''<select id="prodCategoryFilter" onchange="loadProducts()">

        <option value="">All Categories</option>

        <option value="__lowstock__">\u26a0\ufe0f Low Stock (< 20)</option>

        <option value="Pain Relief">Pain Relief</option>

        <option value="Cold & Flu">Cold & Flu</option>

        <option value="Vitamins & Supplements">Vitamins & Supplements</option>

        <option value="First Aid">First Aid</option>

        <option value="Baby Care">Baby Care</option>

        <option value="Digestive Health">Digestive Health</option>

        <option value="Allergy & Skin Care">Allergy & Skin Care</option>

        <option value="Diabetes Care">Diabetes Care</option>

      </select>'''

d = d.replace(old_filter, new_filter)
print("1. Filter updated")

# 2. Update renderProducts to add stock adjust buttons after the stock label
old_template = ''''<div style="text-align:center;min-width:90px">' +

        '<div class="prod-price">KSh ' + Number(p.price).toLocaleString() + '</div>' +

        '<div class="prod-stock ' + stockClass + '">' + stockLabel + '</div>' +

      '</div>' +'''

# We'll add small +/- buttons below the stock label
new_template = """'<div style="text-align:center;min-width:100px;position:relative">' +

        '<div class="prod-price">KSh ' + Number(p.price).toLocaleString() + '</div>' +

        '<div class="prod-stock ' + stockClass + '">' + stockLabel + '</div>' +

        '<div style="display:flex;gap:2px;justify-content:center;margin-top:4px">' +
          '<button onclick="quickStock(\\'' + p.id + '\\',-1)" title="Remove 1" style="padding:2px 6px;font-size:11px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:3px;cursor:pointer">-1</button>' +
          '<button onclick="quickStock(\\'' + p.id + '\\',-5)" title="Remove 5" style="padding:2px 6px;font-size:11px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:3px;cursor:pointer">-5</button>' +
          '<button onclick="quickStock(\\'' + p.id + '\\',1)" title="Add 1" style="padding:2px 6px;font-size:11px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:3px;cursor:pointer">+1</button>' +
          '<button onclick="quickStock(\\'' + p.id + '\\',5)" title="Add 5" style="padding:2px 6px;font-size:11px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:3px;cursor:pointer">+5</button>' +
        '</div>' +

      '</div>' +"""

d = d.replace(old_template, new_template)
print("2. Stock adjust buttons added to template")

# 3. Update inventory summary to show low stock items
old_summary = """document.getElementById('inventorySummary').innerHTML =

      '<strong>\U0001f4ca Inventory Summary</strong> \u2014 ' + catCount + ' products across ' + catNames.length + ' categories | \u2705 ' + inStock + ' in stock | \u26a0\ufe0f ' + lowStock + ' low stock | \U0001f4e6 ' + totalStock + ' total units';

    document.getElementById('inventorySummary').style.display = 'block';"""

new_summary = """document.getElementById('inventorySummary').innerHTML =

      '<strong>\U0001f4ca Inventory Summary</strong> \u2014 ' + catCount + ' products across ' + catNames.length + ' categories | \u2705 ' + inStock + ' in stock | \u26a0\ufe0f ' + lowStock + ' low stock | \U0001f4e6 ' + totalStock + ' total units' +

      (lowStockItems.length > 0 ? '<div style="margin-top:8px;font-size:12px;color:#c62828"><strong>\u26a0\ufe0f Low Stock Items:</strong> ' + lowStockItems.join(', ') + '</div>' : '');

    document.getElementById('inventorySummary').style.display = 'block';"""

d = d.replace(old_summary, new_summary)
print("3. Summary updated")

# Need to add lowStockItems array to the loop
old_loop = """var totalStock = 0;

  var lowStock = 0;

  var categories = {};"""

new_loop = """var totalStock = 0;

  var lowStock = 0;

  var lowStockItems = [];

  var categories = {};"""

d = d.replace(old_loop, new_loop)
print("4. lowStockItems array added")

# Add lowStockItems.push in the loop
old_push = """if (p.stock !== undefined && p.stock < 20) lowStock++;"""

new_push = """if (p.stock !== undefined && p.stock < 20) { lowStock++; lowStockItems.push(p.name + ' (' + p.stock + ')'); }"""

d = d.replace(old_push, new_push)
print("5. lowStockItems.push added")

# Count inStock variable
old_count = """var catCount = Object.keys(categories).length;

    var catNames = Object.keys(categories);

    var inStock = 0;"""

# Need to count inStock too
new_count = """var catCount = Object.keys(categories).length;

    var catNames = Object.keys(categories);

    var inStock = allProducts.filter(function(x){ return x.stock > 0; }).length;"""

d = d.replace(old_count, new_count)
print("6. inStock counter fixed")

# 7. Add quickStock function + stock history viewer
old_end = """function deleteProduct(id, name) {"""

new_end = """function quickStock(id, change) {

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

function deleteProduct(id, name) {"""

d = d.replace(old_end, new_end)
print("7. quickStock function added")

# 8. Update loadProducts to handle __lowstock__ filter
old_filter_check = """if (req.query.category) filter.category = req.query.category;"""
# This is in the API, not admin.html. Let me handle it in the loadProducts JS function instead.

# Find the loadProducts function
old_load = """function loadProducts() {

  var cat = document.getElementById('prodCategoryFilter').value;

  var q = document.getElementById('prodSearchBox').value.trim();"""

new_load = """function loadProducts() {

  var cat = document.getElementById('prodCategoryFilter').value;

  var q = document.getElementById('prodSearchBox').value.trim();

  var isLowStockFilter = (cat === '__lowstock__');"""

d = d.replace(old_load, new_load)
print("8. isLowStockFilter variable added")

# Update the fetch URL in loadProducts to handle __lowstock__
old_fetch = """fetch(API + '/products?all=true' + (cat ? '&category=' + encodeURIComponent(cat) : '') + (q ? '&search=' + encodeURIComponent(q) : ''))"""

new_fetch = """fetch(API + '/products?all=true' + (cat && cat !== '__lowstock__' ? '&category=' + encodeURIComponent(cat) : '') + (q ? '&search=' + encodeURIComponent(q) : ''))"""

d = d.replace(old_fetch, new_fetch)
print("9. Fetch URL updated for low stock filter")

# Add low stock filtering after the fetch response
old_then = """.then(function(data){

    if (!data.success) { throw new Error(data.error); }

    allProducts = data.products || [];"""

new_then = """.then(function(data){

    if (!data.success) { throw new Error(data.error); }

    allProducts = data.products || [];

    if (isLowStockFilter) {

      allProducts = allProducts.filter(function(x){ return x.stock < 20; });

    }"""

d = d.replace(old_then, new_then)
print("10. Low stock client-side filter added")

# Write back
with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
    f.write(d)
print("\nDone! File updated.")
