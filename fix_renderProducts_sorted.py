"""Replace renderProducts with sorted + cleaner layout (use "'" pattern for quoting)"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = bytearray(f.read())

import re

# Find renderProducts boundaries
ss = d.find(b"function renderProducts")
se = d.find(b"function showEditProduct", ss)

# The key: use + "'" + oid + "'" + pattern instead of \' escaping
# Build the JS string with simple constructor
new_func_lines = []

def line(s):
    new_func_lines.append(s.encode("utf-8"))

line("function renderProducts() {")
line("")
line("  var el = document.getElementById('productList');")
line("")
line("  if (allProducts.length === 0) {")
line("    el.innerHTML = '<div style=\"padding:60px;text-align:center;color:#999\">No products found. Click \"+ Add Product\" to get started.</div>';")
line("    document.getElementById('inventorySummary').style.display = 'none';")
line("    return;")
line("  }")
line("")
line("  // Sort alphabetically by name")
line("  var sorted = allProducts.slice().sort(function(a, b) {")
line("    var na = (a.name || '').toLowerCase();")
line("    var nb = (b.name || '').toLowerCase();")
line("    if (na < nb) return -1;")
line("    if (na > nb) return 1;")
line("    return 0;")
line("  });")
line("")
line("  var html = '';")
line("  var totalStock = 0;")
line("  var lowStock = 0;")
line("  var lowStockItems = [];")
line("  var categories = {};")
line("")
line("  for (var i = 0; i < sorted.length; i++) {")
line("")
line("    var p = sorted[i];")
line("    totalStock += (p.stock || 0);")
line("    if (p.stock !== undefined && p.stock < 20) { lowStock++; lowStockItems.push(p.name + ' (' + p.stock + ')'); }")
line("    if (!categories[p.category]) categories[p.category] = 0;")
line("    categories[p.category]++;")
line("    var stockClass = p.stock <= 0 ? 'stock-out' : p.stock < 20 ? 'stock-low' : 'stock-ok';")
line("    var stockLabel = p.stock <= 0 ? 'Out of stock' : p.stock + ' in stock';")
line("")
line("    html += '<div class=\"product-card\">' +")
line("      '<div style=\"display:flex;gap:10px;flex:1;min-width:0\">' +")
line("")
line("      " + "(p.image ? '<div style=\"width:44px;height:44px;flex-shrink:0;border-radius:6px;overflow:hidden;background:#f0f0f0\"><img src=\"' + p.image + '\" alt=\"' + p.name + '\" style=\"width:100%;height:100%;object-fit:cover\" onerror=\"this.remove()\"></div>' : '') +")
line("")
line("      '<div style=\"min-width:0;flex:1\">' +")
line("      '<div class=\"prod-name\">' + p.name + '</div>' +")
line("      '<div class=\"prod-cat\">' + (p.category || '') + ' \\u2022 ' + p.id + '</div>' +")
line("      '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +")
line("    '</div>' +")
line("")
line("    '<div style=\"display:flex;align-items:center;gap:8px\">' +")
line("")
line("      '<div style=\"text-align:right;min-width:80px\">' +")
line("        '<div class=\"prod-price\">KSh ' + Number(p.price).toLocaleString() + '</div>' +")
line("        '<div class=\"prod-stock ' + stockClass + '\">' + stockLabel + '</div>' +")
line("      '</div>' +")
line("")
line("      '<div style=\"display:grid;grid-template-columns:1fr 1fr;gap:2px;width:80px\">' +")
line("        '<button onclick=\"quickStock(' + \"'\" + p.id + \"'\" + ',-1)\" title=\"Remove 1\" style=\"padding:2px 6px;font-size:11px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:3px;cursor:pointer\">-1</button>' +")
line("        '<button onclick=\"quickStock(' + \"'\" + p.id + \"'\" + ',-5)\" title=\"Remove 5\" style=\"padding:2px 6px;font-size:11px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:3px;cursor:pointer\">-5</button>' +")
line("        '<button onclick=\"quickStock(' + \"'\" + p.id + \"'\" + ',1)\" title=\"Add 1\" style=\"padding:2px 6px;font-size:11px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:3px;cursor:pointer\">+1</button>' +")
line("        '<button onclick=\"quickStock(' + \"'\" + p.id + \"'\" + ',5)\" title=\"Add 5\" style=\"padding:2px 6px;font-size:11px;background:#e8f5e9;color:#2e7d32;border:1px solid #a5d6a7;border-radius:3px;cursor:pointer\">+5</button>' +")
line("      '</div>' +")
line("")
line("    '</div>' +")
line("")
line("    '<div style=\"display:flex;gap:4px\">' +")
line("")
line("      '<button class=\"btn btn-primary\" onclick=\"showEditProduct(' + \"'\" + p.id + \"'\" + ')\" style=\"font-size:11px;padding:6px 12px\">Edit</button>' +")
line("")
line("      " + "(p.featured ? '<button onclick=\"toggleFeatured(' + \"'\" + p.id + \"'\" + ',false)\" style=\"font-size:11px;padding:6px 10px;background:#e8f5e9;color:#2e7d32;border:1px solid #2e7d32;border-radius:4px;cursor:pointer\">\\u2b50 Featured</button>' : '<button onclick=\"toggleFeatured(' + \"'\" + p.id + \"'\" + ',true)\" style=\"font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer\">\\u2b50 Feature</button>') +")
line("")
line("      " + "(p.specialOffer ? '<button onclick=\"toggleSpecial(' + \"'\" + p.id + \"'\" + ',false)\" style=\"font-size:11px;padding:6px 10px;background:#fff3e0;color:#e65100;border:1px solid #e65100;border-radius:4px;cursor:pointer\">\\ud83d\\udd25 On Sale</button>' : '<button onclick=\"toggleSpecial(' + \"'\" + p.id + \"'\" + ',true)\" style=\"font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer\">\\ud83d\\udd25 Offer</button>') +")
line("")
line("      '<button class=\"btn\" onclick=\"deleteProduct(' + \"'\" + p.id + \"'\" + ',\\'\" + p.name.replace(/'/g,\\\"\\\\'\\\") + \"'\\')\" style=\"font-size:11px;padding:6px 12px;background:#ffebee;color:#c62828;border:none;border-radius:4px;cursor:pointer\">Del</button>' +")
line("")
line("    '</div></div>';")
line("")
line("  }")
line("")
line("  el.innerHTML = html;")
line("")
line("  // Inventory summary")
line("  var catCount = Object.keys(categories).length;")
line("  document.getElementById('inventorySummary').style.display = 'block';")
line("  document.getElementById('inventorySummary').innerHTML =")
line("    '<strong>\\ud83d\\udcca Inventory Summary</strong> \\u2014 ' + sorted.length + ' products across ' + catCount + ' categories &nbsp;|&nbsp; ' +")
line("    '<span class=\"stock-ok\">\\u2705 ' + (sorted.length - lowStock) + ' in stock</span> &nbsp;|&nbsp; ' +")
line("    '<span class=\"stock-low\">\\u26a0\\ufe0f ' + lowStock + ' low stock</span> &nbsp;|&nbsp; ' +")
line("    '\\ud83d\\udce6 ' + totalStock + ' total units' +")
line("    (lowStockItems.length > 0 ? '<div style=\"margin-top:10px;font-size:12px;line-height:1.6\">' +")
line("      '<strong style=\"color:#c62828\">\\u26a0\\ufe0f Low Stock Items:</strong> ' +")
line("      lowStockItems.join(' &nbsp;|&nbsp; ') +")
line("    '</div>' : '');")
line("")
line("}")

new_bytes = b"\r\n".join(new_func_lines)

d[ss:se] = new_bytes

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(d)

print(f"Replaced renderProducts: {len(new_bytes)} bytes")

# Validate JS
script_start = d.find(b"<script>") + len(b"<script>")
script_end = d.find(b"</script>", script_start)
js = d[script_start:script_end]
import tempfile, subprocess, os
with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    fn = f.name
r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=10)
os.unlink(fn)
if r.returncode == 0:
    print("JS syntax: OK")
else:
    print("JS syntax ERROR:", r.stderr)
