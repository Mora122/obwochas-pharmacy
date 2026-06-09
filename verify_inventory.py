"""Verify admin.html JS syntax"""
import subprocess
import tempfile
import os

with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Find last script tag
ss = d.rfind(b"<script>")
se = d.find(b"</script>", ss+8)
js = d[ss+8:se].replace(b"\r", b"")

with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    fn = f.name

r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=5)
if r.returncode == 0:
    print("JS VALID! No syntax errors.")
else:
    print("SYNTAX ERROR:")
    print(r.stderr)
os.unlink(fn)

# Also verify the inline template escaping
# Check for the quickStock template button
content = d.decode("utf-8", errors="replace")
checks = [
    ("quickStock", "quickStock function"),
    ('__lowstock__', "low stock filter"),
    ("prodCategoryFilter", "filter dropdown"),
    ("Inventory Summary", "summary section"),
    ("inStock", "inStock variable"),
]
for pat, name in checks:
    print(f"  {name}: {'OK' if pat in content else 'MISSING'}")
