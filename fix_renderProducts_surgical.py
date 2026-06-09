"""Apply surgical edits to renderProducts: add sort + cleaner layout"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = bytearray(f.read())

func_start = d.find(b"function renderProducts")
func_end = d.find(b"function showAddProduct", func_start)

old = d[func_start:func_end].decode("utf-8")

# 1. After var categories = {}; add sort block
new1 = old.replace(
    "  var categories = {};\r\n",
    "  var categories = {};\r\n"
    "  // Sort alphabetically by name\r\n"
    "  var sorted = allProducts.slice().sort(function(a, b) {\r\n"
    '    var na = (a.name || "").toLowerCase();\r\n'
    '    var nb = (b.name || "").toLowerCase();\r\n'
    "    if (na < nb) return -1;\r\n"
    "    if (na > nb) return 1;\r\n"
    "    return 0;\r\n"
    "  });\r\n"
)

# 2. Change for loop from allProducts.length to sorted.length
new2 = new1.replace(
    "for (var i = 0; i < allProducts.length; i++)",
    "for (var i = 0; i < sorted.length; i++)"
)

# 3. Change allProducts[i] to sorted[i]
new3 = new2.replace(
    "    var p = allProducts[i];",
    "    var p = sorted[i];"
)

# 4. Replace card template with cleaner layout
card_start = new3.find("html += '<div class=\"product-card\">'")
card_end = new3.find("el.innerHTML = html;")

new_card = (
    "    html += '<div class=\"product-card\">' +\r\n"
    "      '<div class=\"prod-row\"><div class=\"prod-info\">' +\r\n"
    "        (p.image ? '<div class=\"prod-thumb\"><img src=\"' + p.image + '\" alt=\"' + p.name + '\" onerror=\"this.remove()\"></div>' : '') +\r\n"
    "        '<div>' +\r\n"
    "        '<div class=\"prod-name\">' + p.name + '</div>' +\r\n"
    "        '<div class=\"prod-cat\">' + (p.category || '') + ' \\u2022 ' + p.id + '</div>' +\r\n"
    "        '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +\r\n"
    "      '</div></div>' +\r\n"
    "      '<div class=\"prod-meta\">' +\r\n"
    "        '<div class=\"prod-price\">KSh ' + Number(p.price).toLocaleString() + '</div>' +\r\n"
    "        '<div class=\"prod-stock ' + stockClass + '\">' + stockLabel + '</div>' +\r\n"
    "      '</div>' +\r\n"
    "      '<div class=\"prod-actions\">' +\r\n"
    "        '<div class=\"stock-btns\">' +\r\n"
    "          '<button onclick=\"quickStock(\\'' + p.id + '\\',-1)\" title=\"Remove 1\" class=\"sb sb--\">-1</button>' +\r\n"
    "          '<button onclick=\"quickStock(\\'' + p.id + '\\',-5)\" title=\"Remove 5\" class=\"sb sb--\">-5</button>' +\r\n"
    "          '<button onclick=\"quickStock(\\'' + p.id + '\\',1)\" title=\"Add 1\" class=\"sb sb+\">+1</button>' +\r\n"
    "          '<button onclick=\"quickStock(\\'' + p.id + '\\',5)\" title=\"Add 5\" class=\"sb sb+\">+5</button>' +\r\n"
    "        '</div>' +\r\n"
    "        '<div class=\"action-btns\">' +\r\n"
    "          '<button class=\"btn btn-primary\" onclick=\"showEditProduct(\\'' + p.id + '\\')\">Edit</button>' +\r\n"
    "          (p.featured ? '<button onclick=\"toggleFeatured(\\'' + p.id + '\\',false)\" class=\"btn-feat on\">\\u2b50 Featured</button>' : '<button onclick=\"toggleFeatured(\\'' + p.id + '\\',true)\" class=\"btn-feat\">\\u2b50 Feature</button>') +\r\n"
    "          (p.specialOffer ? '<button onclick=\"toggleSpecial(\\'' + p.id + '\\',false)\" class=\"btn-offer on\">\\ud83d\\udd25 On Sale</button>' : '<button onclick=\"toggleSpecial(\\'' + p.id + '\\',true)\" class=\"btn-offer\">\\ud83d\\udd25 Offer</button>') +\r\n"
    "          '<button class=\"btn-del\" onclick=\"deleteProduct(\\'' + p.id + '\\',\\'' + p.name.replace(/'/g,\\\"\\\\'\\\") + '\\')\">Del</button>' +\r\n"
    "        '</div>' +\r\n"
    "      '</div></div>';\r\n"
    "\r\n"
    "  }\r\n"
    "\r\n"
    "  el.innerHTML = html;\r\n"
)

new4 = new3[:card_start] + new_card + new3[card_end:]

# 5. Fix inventory summary to use sorted.length
new5 = new4.replace(
    "allProducts.length + ' products across",
    "sorted.length + ' products across"
)
new5 = new5.replace(
    "allProducts.length + ' in stock",
    "sorted.length + ' in stock"
)

# Write back
d[func_start:func_end] = new5.encode("utf-8")
with open("goodlife-replica/admin.html", "wb") as f:
    f.write(d)

print("Applied edits")

# Validate JS
ss = d.find(b"<script>") + len(b"<script>")
se = d.find(b"</script>", ss)
js = d[ss:se]
import tempfile, subprocess, os
with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    fn = f.name
r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=10, encoding="utf-8")
os.unlink(fn)
if r.returncode == 0:
    print("JS syntax: OK")
else:
    print("JS syntax ERROR:", r.stderr[:2000])
