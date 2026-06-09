"""Verify the LAST inline script in admin.html"""
import subprocess
import tempfile
import os

with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Find ALL script tags (inline ones don't have src)
pos = 0
scripts = []
while True:
    ss = d.find(b"<script>", pos)
    if ss < 0:
        break
    se = d.find(b"</script>", ss+8)
    if se < 0:
        break
    scripts.append((ss, se, d[ss+8:se]))
    pos = se + 9

print(f"Found {len(scripts)} inline script(s)")

# Check each
for i, (ss, se, js) in enumerate(scripts):
    js = js.replace(b"\r", b"").strip()
    if len(js) < 50:
        print(f"  Script {i}: ({len(js)} bytes, skipping)")
        continue
    
    with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
        f.write(js.replace(b"\r", b""))
        fn = f.name
    
    r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=5)
    if r.returncode == 0:
        print(f"  Script {i}: VALID ({len(js)} bytes)")
    else:
        error_line = r.stderr.split("\n")[0] if r.stderr else "unknown"
        print(f"  Script {i}: SYNTAX ERROR: {error_line}")
    os.unlink(fn)

# Quick verification of key features in the full file
content = d.decode("utf-8", errors="replace")
features = [
    ("quickStock(", "quickStock function"),
    ("__lowstock__", "low stock filter option"),
    ("lowStockItems", "lowStockItems tracking"),
    ("inStock", "inStock variable"),
    ("-1", "stock -1 button"),
    ("+5", "stock +5 button"),
]
for pat, name in features:
    print(f"  {name}: {'OK' if pat in content else 'MISSING'}")
