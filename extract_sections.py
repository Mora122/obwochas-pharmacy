"""Extract renderProducts and filter sections from admin.html"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find renderProducts
idx = d.find("function renderProducts")
if idx >= 0:
    # Find the next function or other section boundary
    patterns = [
        "function ", "// ", "/* ", "</script>"
    ]
    end = len(d)
    for p in patterns:
        pos = d.find(p, idx + 30)
        if pos > 0 and pos < end:
            end = pos
    with open("goodlife-replica/renderProducts_part.txt", "w", encoding="utf-8") as out:
        out.write(d[idx:end])
print(f"renderProducts: {idx} -> {end} ({end-idx} chars)")

# Find filter
idx2 = d.find('productCategoryFilter')
print(f"\nproductCategoryFilter at {idx2}")

# Find inventory summary section
idx3 = d.find("Inventory Summary")
print(f"Inventory Summary at {idx3}")

# Find the function that builds the HTML section with ⭐ Feature buttons (the template section)
idx4 = d.find("toggleFeatured")
# Find the template string around it
start = d.rfind("function toggleFeatured", 0, idx4)
if start < 0:
    start = d.rfind("renderProducts", 0, idx4)
print(f"\nArea around template at {start}")
