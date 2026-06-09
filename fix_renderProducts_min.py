"""MINIMAL edit: add sort, keep ALL card template EXACTLY as-is"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = bytearray(f.read())

func_start = d.find(b"function renderProducts")
func_end = d.find(b"function showAddProduct", func_start)

old = d[func_start:func_end]

# Step 1: Add sort block after "  var categories = {};\r\n"
sort_bytes = (
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

new = old.replace(b"  var categories = {};\r\n", sort_bytes, 1)

# Step 2: Replace loop variable (only the first occurrence)
new = new.replace(b"for (var i = 0; i < allProducts.length; i++)", b"for (var i = 0; i < sorted.length; i++)", 1)
new = new.replace(b"var p = allProducts[i];", b"var p = sorted[i];", 1)

# Step 3: Inventory summary refs
new = new.replace(b"allProducts.length + ' products across", b"sorted.length + ' products across", 1)
new = new.replace(b"allProducts.length + ' in stock", b"sorted.length + ' in stock", 1)

# Write back
d[func_start:func_end] = new

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(d)

print(f"Replaced: {len(new)} bytes")

# Validate
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
