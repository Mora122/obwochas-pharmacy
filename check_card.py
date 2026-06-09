"""Extract saveProduct and product card"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Full saveProduct
idx = d.find("async function saveProduct")
end = d.find("loadOrders", idx)
section = d[idx:end]
with open("goodlife-replica/saveProduct_full.txt", "w", encoding="utf-8") as f:
    f.write(section)

# Product card template
idx = d.find("html += '<div class=\\\"product-card\\\"")
if idx < 0:
    # Try without escapes
    idx = d.find("html += '<div class=\"product-card\"")
if idx >= 0:
    end = d.find("el.innerHTML = html", idx)
    section = d[idx:end]
    with open("goodlife-replica/product_card_template.txt", "w", encoding="utf-8") as f:
        f.write(section)
    print(f"Product card: {len(section)} chars")
    if "<img" in section or "'<img" in section:
        print("HAS image tag")
    else:
        print("NO image tag - images missing from card!")
else:
    print("product-card not found in template")
