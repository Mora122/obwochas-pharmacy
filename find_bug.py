"""Find the exact syntax error location in deployed admin.html"""
import urllib.request

resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/admin.html")
html = resp.read()
script_start = html.find(b"<script>")
script_end = html.find(b"</script>", script_start+8)
js = html[script_start+8:script_end]

# Search for the double-quote issue that Node found
target = b"''<div style"
idx = js.find(target)
if idx >= 0:
    print(f"Found broken pattern at byte {idx}:")
    print(repr(js[max(0,idx-60):idx+60]))
else:
    print("Pattern not found directly")
    # Search more broadly
    for pat in [b"div style", b"''", b"flex;gap"]:
        i = js.find(pat)
        if i >= 0:
            print(f"Found {pat!r} at byte {i}: {repr(js[max(0,i-40):i+50])}")
    
# Show the area around the template section
idx2 = js.find(b"product-actions")
if idx2 >= 0:
    print(f"\nproduct-actions at byte {idx2}")
    print(repr(js[idx2:idx2+200]))
