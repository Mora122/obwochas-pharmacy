"""Find the product filter dropdown"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the Products tab content section
idx = d.find('id="productsTab"')
if idx < 0:
    idx = d.find('tab-content')
print(f"productsTab/tab-content at {idx}")

# Show ~1000 chars after it
if idx > 0:
    section = d[idx:idx+3000]
    with open("goodlife-replica/products_tab_html.txt", "w", encoding="utf-8") as out:
        out.write(section)
    print("Written to products_tab_html.txt")

# Also find the renderProducts template section (the HTML string)
idx2 = d.find("renderProducts")
if idx2 >= 0:
    sec = d[idx2:idx2+3000]
    with open("goodlife-replica/renderProducts.txt", "w", encoding="utf-8") as out:
        out.write(sec)
    print("renderProducts: written")
