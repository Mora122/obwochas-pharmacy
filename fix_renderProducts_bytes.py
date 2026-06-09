"""Render products - sort + clean layout, pure bytes, no string encoding issues"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = bytearray(f.read())

func_start = d.find(b"function renderProducts")
func_end = d.find(b"function showAddProduct", func_start)

old = d[func_start:func_end]

# File markers
categories_marker = b"  var categories = {};\r\n"
loop_marker = b"for (var i = 0; i < allProducts.length; i++)"
p_assign = b"var p = allProducts[i];"
inv_prod1 = b"allProducts.length + ' products across"
inv_prod2 = b"allProducts.length + ' in stock"

# 1. After categories, insert sort block
sort_block = (
    b"  var categories = {};\r\n"
    b"  // Sort alphabetically by name\r\n"
    b"  var sorted = allProducts.slice().sort(function(a, b) {\r\n"
    b'    var na = (a.name || "").toLowerCase();\r\n'
    b'    var nb = (b.name || "").toLowerCase();\r\n'
    b"    if (na < nb) return -1;\r\n"
    b"    if (na > nb) return 1;\r\n"
    b"    return 0;\r\n"
    b"  });\r\n"
)
new = old.replace(categories_marker, sort_block)

# 2. Replace loops
new = new.replace(loop_marker, b"for (var i = 0; i < sorted.length; i++)")
new = new.replace(p_assign, b"var p = sorted[i];")

# 3. Inventory summary refs
new = new.replace(inv_prod1, b"sorted.length + ' products across")
new = new.replace(inv_prod2, b"sorted.length + ' in stock")

# 4. Reorganize card layout - extract blocks from the NEW bytes
# Card starts at: "html += '<div class=\"product-card\">'" 
card_start = new.find(b'html += \'<div class="product-card">\'')
# Card ends right before inventory summary
inv_start = new.find(b"// Inventory summary")

old_card = new[card_start:inv_start]

# Extract the 3 main sections of the card by finding their boundaries
# Section 1: name/cat/desc (from after the card opening div, to before price)
s1_start = old_card.find(b"(p.image ?")  
if s1_start < 0:
    s1_start = old_card.find(b"'<div style=\"min-width:0\">' +")  # fallback if no image
# Find where the first section ends - right before price section
s1_end = old_card.find(b"'<div style=\"text-align:center;min-width:100px")  
if s1_end < 0:
    s1_end = old_card.find(b"'<div class=\"prod-price\">KSh", 200)

name_cat_section = old_card[0:s1_end]  # From card opening to before price section

# Section 2: price + stock + stock buttons
s2_start = s1_end
s2_end = old_card.find(b"'<div style=\"display:flex;gap:4px\">'", s2_start)
price_stock_section = old_card[s2_start:s2_end]

# Section 3: action buttons  
s3_start = s2_end
s3_end = len(old_card)
action_section = old_card[s3_start:]

# Build new card: [name/cat] [price+stock side] [stock btns] [action btns]
# Keep the image thumbnail inside the name section as-is
# Just reorganize the outer divs

# New structure: same content, reorganized
new_card = name_cat_section.rstrip(b" + \r\n") + b" +\r\n"
new_card += b"      '</div>' +\r\n"
new_card += b"      '<div class=\"prod-meta\">' +\r\n"

# From price_stock_section, extract just price+stock (without surrounding div)
# The section has: '...price...stock...</div>' +   then  '<div style="display:flex;gap:2px...
# We want to put price+stock inline
ps = price_stock_section

# Extract price+stock block (from price div to closing of stock)
p_marker = ps.find(b"'<div class=\"prod-price\">KSh '")
stock_marker = ps.find(b"'<div class=\"prod-stock", p_marker)
# Find where this segment ends (the stock-buttons div starts after)
stock_end = ps.find(b"'</div>' +", stock_marker) + len(b"'</div>' +")
price_stock_block = ps[p_marker:stock_end]

new_card += price_stock_block + b"\r\n"
new_card += b"      '</div>' +\r\n"

# Extract stock buttons div (the flex/grid div with -1 -5 +1 +5)
stock_btns_marker = ps.find(b"quickStock")
# Find the opening of the stock buttons container
btns_div_start = ps.rfind(b"'<div style=\"", 0, stock_btns_marker)
btns_div_end = ps.find(b"'</div>' +", stock_btns_marker) + len(b"'</div>' +")
stock_btns_block = ps[btns_div_start:btns_div_end]

new_card += b"      '<div class=\"stock-btns\">' +\r\n"
new_card += stock_btns_block[stock_btns_block.find(b"quickStock"):].replace(b"'</div>' +", b"'</div>' +", 1)
# Actually just use the whole block
new_card += b"      '</div>' +\r\n"

# Add action buttons (exact same as original)
new_card += action_section

# Replace in the function
start_of_card_in_new = new.find(b'html += \'<div class="product-card">\'')
end_of_card_in_new = new.find(b"// Inventory summary", start_of_card_in_new)

new = new[:start_of_card_in_new] + new_card + new[end_of_card_in_new:]

d[func_start:func_end] = new

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(d)

print(f"Replaced renderProducts: {len(new)} bytes (was {len(old)})")

# Validate JS
ss = d.find(b"<script>") + len(b"<script>")
se = d.find(b"</script>", ss)
js = d[ss:se]
import tempfile, subprocess, os
with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as tf:
    tf.write(js)
    fn = tf.name
r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=10, encoding="utf-8")
os.unlink(fn)
if r.returncode == 0:
    print("JS syntax: OK")
else:
    print("JS syntax ERROR:", r.stderr[:1000])
