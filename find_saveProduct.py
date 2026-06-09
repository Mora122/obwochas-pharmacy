"""Find saveProduct function and how it handles images"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("saveProduct")
if idx >= 0:
    # Find start of function
    start = d.rfind("function", 0, idx)
    if start < 0: start = idx
    # Find next function
    end = d.find("\n\nfunction ", idx)
    if end < 0: end = idx + 3000
    section = d[start:end]
    with open("goodlife-replica/saveProduct_func.txt", "w", encoding="utf-8") as f:
        f.write(section)
    print(f"saveProduct ({len(section)} chars)")

# Also check the modal HTML for image field
idx = d.find("prodImage")
if idx >= 0:
    start = d.rfind("<div", 0, idx) 
    end = d.find("</div>", idx) + 6
    section = d[start:end]
    print(f"\nprodImage field: {section.strip()}")

# Check if image is in the product card template
idx = d.find("prod-name")
if idx >= 0:
    start = d.rfind("product-card", 0, idx)
    end = start + 500
    print(f"\nProduct card around image: {d[start:end][:300]}")
