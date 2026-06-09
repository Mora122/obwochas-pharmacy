"""Check inStock variable"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("var catCount")
if idx >= 0:
    section = d[idx:idx+350]
    print(repr(section))
else:
    print("catCount not found, searching for 'totalStock'...")
    idx = d.find("var totalStock")
    if idx >= 0:
        print(repr(d[idx:idx+350]))
