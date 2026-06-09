"""Verify the admin.html fix"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Search for new escapes
idx1 = d.find(b"\\u2b50")
idx2 = d.find(b"\\ud83d")
print("Has \\u2b50 (star):", idx1)
print("Has \\ud83d (fire):", idx2)

# Search for old bad escapes
idx3 = d.find(b"\\xe2")
idx4 = d.find(b"\\xf0")
print("Has old \\xe2:", idx3)
print("Has old \\xf0:", idx4)

# Check the Featured button context
idx = d.find(b"Featured")
if idx >= 0:
    print("\nFeatured context:", repr(d[idx-30:idx+70]))
    
idx = d.find(b"On Sale")
if idx >= 0:
    print("On Sale context:", repr(d[idx-30:idx+70]))

# Also check index.html for same issue
with open("goodlife-replica/index.html", "rb") as f:
    idata = f.read()

idx5 = idata.find(b"\\xe2")
idx6 = idata.find(b"\\xf0")
print("\n=== index.html check ===")
print("Has literal \\xe2:", idx5)
print("Has literal \\xf0:", idx6)

# Check for bad bytes in index.html
idx7 = idata.find(b"\\u2605")
if idx7 >= 0:
    print("Has \\u2605 at:", idx7)
    print(repr(idata[idx7-20:idx7+60]))

print("\nDone")
