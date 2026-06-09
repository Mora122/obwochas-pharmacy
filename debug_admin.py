"""Debug admin.html - check for JS syntax issues"""
import re

path = "goodlife-replica/admin.html"
with open(path, "rb") as f:
    data = f.read()

# Find the buttons section
idx = data.find(b"showEditProduct")
div_start = data.rfind(b'<div style="display:flex;gap:4px">', 0, idx)
div_end = data.find(b"</div></div>", div_start) + len(b"</div></div>")
section = data[div_start:div_end]

print("=== Product card buttons section ===")
print(f"Bytes {div_start} to {div_end} ({len(section)} bytes)")
print(f"Raw repr:\n{repr(section)}\n")

# Check for bad escape sequences
# The issue: I used double-backslash in Python bytes literal which produced
# literal text "\xe2\xad\x90" instead of actual UTF-8 bytes
# JavaScript treats \x as hex escape
# But since these are in an HTML string rendered by JS, not raw HTML...

# Check special offer section
idx_sale = data.find(b"On Sale")
print(f"\n=== Special section at {idx_sale} ===")
print(repr(data[idx_sale-30:idx_sale+50]))

# Check toggle functions
idx_func = data.find(b"async function toggleFeatured")
print(f"\n=== toggleFeatured function at {idx_func} ===")
if idx_func >= 0:
    # Find the function body
    fn_end = data.find(b"async function toggleSpecial", idx_func)
    print(repr(data[idx_func:fn_end]))

# Check for JavaScript syntax issues
print("\n=== Looking for potential JS errors ===")
# Check if \x literal appears in JS string context
lines = data.decode("utf-8", errors="replace").split("\n")
for i, line in enumerate(lines):
    if "\\xe2" in line or "\\xf0" in line or "\\xad" in line or "\\x90" in line or "\\x9f" in line or "\\x94" in line or "\\xa5" in line:
        print(f"  Line {i+1}: BAD ESCAPE FOUND: {line.strip()[:100]}")

print("\n=== Fix in JS strings: \xe2\xad\x90 should be \u2b50 and \xf0\x9f\x94\xa5 should be \ud83d\udd25 ===")
