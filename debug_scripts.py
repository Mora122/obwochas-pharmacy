"""Debug both inline scripts"""
import subprocess
import tempfile
import os

with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Find inline scripts
scripts = []
pos = 0
while True:
    ss = d.find(b"<script>", pos)
    if ss < 0:
        break
    se = d.find(b"</script>", ss+8)
    if se < 0:
        break
    scripts.append((ss, se, d[ss+8:se]))
    pos = se + 9

for i, (ss, se, js) in enumerate(scripts):
    js = js.replace(b"\r", b"").strip()
    if len(js) < 50:
        print(f"Script {i}: {len(js)} bytes (first 60: {js[:60]})")
        continue
    
    print(f"\nScript {i}: {len(js)} bytes, starting at file byte {ss}")
    print(f"  First 80 chars: {js[:80]}")
    print(f"  Last 80 chars: {js[-80:]}")
    
    # Check for issues
    # Try checking each function
    with tempfile.NamedTemporaryFile(suffix=".js", delete=False) as f:
        f.write(js)
        fn = f.name
    
    r = subprocess.run(["node", "--check", fn], capture_output=True, text=True, timeout=5)
    if r.returncode != 0:
        print(f"  ERROR at line {r.stderr.split('position ')[1].split()[0] if 'position ' in r.stderr else '?'}")
        # Print context around the error
        if "position " in r.stderr:
            try:
                pos_err = int(r.stderr.split("position ")[1].split()[0])
                ctx = js[max(0,pos_err-40):min(len(js),pos_err+40)]
                print(f"  Context: ...{ctx}...")
            except:
                pass
    os.unlink(fn)
