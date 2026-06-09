"""Verify JS syntax with Node"""
import subprocess
import tempfile
import os
import re

with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Extract JS
script_start = d.find(b"<script>")
script_end = d.find(b"</script>", script_start+8)
js = d[script_start+8:script_end]
# Remove \r
js = js.replace(b"\r", b"")

with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    fname = f.name

try:
    result = subprocess.run(
        ["node", "--check", fname],
        capture_output=True, text=True, timeout=5
    )
    if result.returncode == 0:
        print("NO SYNTAX ERRORS! JS is valid.")
    else:
        print("SYNTAX ERROR:", result.stderr)
        match = re.search(r"position (\d+)", result.stderr)
        if match:
            pos = int(match.group(1))
            print(f"\nError near byte {pos}")
            ctx = js[max(0,pos-60):pos+60]
            print(f"Context: {repr(ctx)}")
finally:
    os.unlink(fname)
