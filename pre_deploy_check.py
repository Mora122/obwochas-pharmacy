"""Verify both files and then deploy"""
import subprocess
import tempfile
import os

# Check admin.html JS
with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()
script_end = d.find(b"</script>")
js = d[:script_end]
# Find the last script tag
script_start = d.rfind(b"<script>", 0, script_end)
js = d[script_start+8:script_end]
js = js.replace(b"\r", b"")

with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    admin_fn = f.name

r = subprocess.run(["node", "--check", admin_fn], capture_output=True, text=True, timeout=5)
print("admin.html JS:", "VALID" if r.returncode == 0 else f"ERROR: {r.stderr[:200]}")
os.unlink(admin_fn)

# Check for any remaining literal hex escapes in admin.html
for pat in [b"\\xe2", b"\\xad", b"\\x90"]:
    idx = d.find(pat)
    if idx >= 0:
        print(f"WARNING: {repr(pat)} found in admin.html at {idx}")

# Also check index.html JS
with open("goodlife-replica/index.html", "rb") as f:
    d = f.read()
# Find all scripts
pos = 0
script_num = 0
while True:
    ss = d.find(b"<script>", pos)
    if ss < 0:
        break
    se = d.find(b"</script>", ss+8)
    if se < 0:
        break
    js = d[ss+8:se].replace(b"\r", b"")
    if len(js) > 10:
        with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
            f.write(js)
            fn = f.name
        r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=5)
        print(f"index.html script {script_num}:", "VALID" if r.returncode == 0 else f"ERROR: {r.stderr[:200]}")
        os.unlink(fn)
        script_num += 1
    pos = se + 9

# Check for bad literal escapes in index.html
for pat in [b"\\xf0", b"\\xe2", b"\\x9f"]:
    idx = d.find(pat)
    if idx >= 0:
        print(f"WARNING: {repr(pat)} found in index.html at {idx}: {repr(d[max(0,idx-10):idx+30])}")

print("\nReady to deploy!")
