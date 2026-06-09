"""Find syntax error in main script"""
import subprocess
import tempfile
import os
import re

with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Get main script
ss = d.find(b"<script>")
se = d.find(b"</script>", ss+8)
js = d[ss+8:se].replace(b"\r", b"")

with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    fn = f.name

r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=5)
if r.returncode != 0:
    # Extract position
    match = re.search(r"position (\d+)", r.stderr)
    if match:
        pos = int(match.group(1))
        print(f"Error at byte position {pos}")
        ctx = js[max(0,pos-80):min(len(js),pos+80)]
        print(f"Context: {repr(ctx)}")
        
        # Show the line
        line_start = js.rfind(b"\n", 0, pos) + 1
        line_end = js.find(b"\n", pos)
        if line_end < 0: line_end = len(js)
        line = js[line_start:line_end]
        line_num = js[:pos].count(b"\n") + 1
        print(f"\nLine {line_num}: {repr(line)}")
        print(f"            {' ' * (pos - line_start - 1)}^^^^ here")
    else:
        print(r.stderr[:500])
os.unlink(fn)
