"""Find syntax error"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Get main script
ss = d.find("<script>")
se = d.find("</script>", ss+8)
js = d[ss+8:se].encode("utf-8")

import subprocess, tempfile, os, re
with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
    f.write(js)
    fn = f.name

r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=5)
if r.returncode != 0:
    match = re.search(r"position (\d+)", r.stderr)
    if match:
        pos = int(match.group(1))
        line_start = js.rfind(b"\n", 0, pos) + 1
        line_end = js.find(b"\n", pos)
        if line_end < 0: line_end = len(js)
        line = js[line_start:line_end]
        line_num = js[:pos].count(b"\n") + 1
        print(f"Line {line_num}: {repr(line)}")
        # Show context around error
        ctx = js[max(0,pos-60):min(len(js),pos+60)]
        print(f"Context: {repr(ctx)}")
os.unlink(fn)
