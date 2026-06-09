"""Check for image field in products schema and API"""
# Check the schema in products_db.js
with open("goodlife-replica/lib/products_db.js", "r", encoding="utf-8") as f:
    d = f.read()

# Look for image key assignments
import re
matches = re.findall(r'image[:\s]', d)
print(f"Found {len(matches)} 'image' key references")

# Check if any seed products have image
for i, line in enumerate(d.split("\n")):
    # Look for 'image:' or "image:" 
    if re.search(r'''["']?image["']?\s*:''', line):
        print(f"  L{i+1}: {line.strip()[:120]}")

# Also check API handler
with open("goodlife-replica/api/products.js", "r", encoding="utf-8") as f:
    d2 = f.read()

for i, line in enumerate(d2.split("\n")):
    if "image" in line.lower() and "image" not in ["Im", "Image"]:
        if re.search(r'image', line, re.IGNORECASE):
            print(f"  API L{i+1}: {line.strip()[:120]}")
