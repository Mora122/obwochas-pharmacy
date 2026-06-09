"""Debug the exact replacement boundaries"""
import os

path = "goodlife-replica/admin.html"
with open(path, "rb") as f:
    d = f.read()

idx_start = d.find(b"showEditProduct")
section_start = d.rfind(b"display:flex", 0, idx_start)
div_start = d.rfind(b"<div", 0, section_start)

# Show what's around div_start
print(f"div_start = {div_start}")
print(f"Bytes around div_start:")
print(repr(d[div_start-30:div_start+20]))

# Show what the original byte at div_start is
print(f"\nChar at div_start: {chr(d[div_start])!r}")

# What about right before my replacement in the CURRENT file?
print(f"\nContext 60 bytes BEFORE my replacement section:")
print(repr(d[div_start-60:div_start]))

print(f"\nContext at start of my replacement section:")
print(repr(d[div_start:div_start+80]))

# Now check: is the '' from a previous ' that should be included in my section?
# Or is the '' caused by my section starting with ' AND the previous line ending with '?
