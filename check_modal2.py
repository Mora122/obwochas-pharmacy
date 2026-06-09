"""Check modal HTML for Image URL field"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("productModal")
section = d[idx:idx+3000]
print(section)

# Also check the + Add Product button handler
idx2 = d.find("+ Add Product")
if idx2 >= 0:
    ctx = d[idx2-100:idx2+200]
    print(f"\n\n--- Add Product context: ---\n{ctx}")
