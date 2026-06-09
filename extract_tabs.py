"""Find product tab HTML and other sections"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find Products tab
idx = d.find('id="tab-products"')
if idx >= 0:
    end = d.find('id="productModal"', idx)
    if end < 0:
        end = idx + 2000
    section = d[idx:end]
    with open("goodlife-replica/tab_products.txt", "w", encoding="utf-8") as out:
        out.write(section)
    print("Products tab HTML written to tab_products.txt")

# Find the filter dropdown
idx2 = d.find("tab-products")
after = d[idx2:idx2+1000]
with open("goodlife-replica/tab_products_filter.txt", "w", encoding="utf-8") as out:
    out.write(after)
print("Filter area written")

# Find the rest of renderProducts (the end of the function)
idx3 = d.find("renderProducts")
end_render = d.find("function ", idx3+20)
if end_render < 0:
    end_render = d.find("<script", idx3+20)
if end_render < 0:
    end_render = idx3 + 4000
with open("goodlife-replica/render_rest.txt", "w", encoding="utf-8") as out:
    out.write(d[idx3:end_render])
print(f"renderProducts full: {idx3} -> {end_render}")

# Find inventory summary section
idx4 = d.find("Inventory Summary")
print(f"Inventory Summary at {idx4}")
idx5 = d.find("</div>", idx4)
after_summary = d[idx4:idx5+80]
with open("goodlife-replica/summary.txt", "w", encoding="utf-8") as out:
    out.write(after_summary)
