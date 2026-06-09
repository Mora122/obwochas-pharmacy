"""Check if homepage shop/products display images"""
with open("goodlife-replica/index.html", "r", encoding="utf-8") as f:
    d = f.read()

# Check for image/product display
for i, line in enumerate(d.split("\n")):
    if "img" in line.lower() and ("src" in line.lower() or "product" in line.lower() or "image" in line.lower()):
        print(f"  L{i+1}: {line.strip()[:150]}")
        
# Check loadFeaturedProducts / loadSpecialOffers functions
for func_name in ["loadFeaturedProducts", "loadSpecialOffers", "loadProducts"]:
    idx = d.find(func_name)
    if idx >= 0:
        start = d.rfind("\nfunction", 0, idx)
        if start < 0: start = idx
        end = d.find("\n\n", idx)
        if end < 0: end = idx + 1000
        section = d[start:end].strip()
        with open(f"goodlife-replica/{func_name}.txt", "w", encoding="utf-8") as f:
            f.write(section)
        print(f"\n{func_name}: {len(section)} chars")
