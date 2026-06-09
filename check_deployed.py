"""Check if functions exist in deployed admin.html"""
import urllib.request

resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/admin.html")
raw = resp.read()

# Search in raw bytes to avoid encoding issues
for pattern, name in [
    (b"function switchTab", "switchTab function"),
    (b"function loadProducts", "loadProducts function"),
    (b"function loadOrders", "loadOrders function"),
    (b"API = '/api'", "API definition"),
    (b"toggleFeatured", "toggleFeatured"),
]:
    idx = raw.find(pattern)
    if idx >= 0:
        print(f"FOUND {name} at byte {idx}")
    else:
        print(f"MISSING {name}")

# Check what's around the script tag area
script_start = raw.find(b"<script>")
print(f"\nFirst <script> at byte {script_start}")
if script_start >= 0:
    print(f"Content: {repr(raw[script_start:script_start+50])}")
    script_end = raw.find(b"</script>", script_start+20)
    print(f"Ends at {script_end}, length = {script_end - script_start}")
    
    # Check for JS content
    js = raw[script_start+8:script_end]
    print(f"JS starts with: {repr(js[:80])}")
    
    # Check for function definitions
    for func in [b"switchTab", b"loadProducts", b"loadOrders"]:
        pos = js.find(func)
        if pos >= 0:
            print(f"  {repr(func)} at JS offset {pos}")
