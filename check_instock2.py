"""Check inStock variable"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("var catCount")
if idx >= 0:
    section = d[idx:idx+350]
    with open("goodlife-replica/instock_debug.txt", "w", encoding="utf-8") as out:
        out.write(section)
    print(f"Written {len(section)} chars to instock_debug.txt")
else:
    print("catCount not found")
