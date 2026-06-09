"""Find order card rendering template"""
path = "goodlife-replica/admin.html"
with open(path, "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("function renderOrders()")
end = d.find("function showOrderDetail", idx)
section = d[idx:end]
with open("goodlife-replica/renderOrders_full.txt", "w", encoding="utf-8") as f:
    f.write(section)
print(f"Section length: {len(section)} chars")

for pat in ["var html = ''", "html +=", "filtered.forEach", "order-card", "html = '"]:
    pos = section.find(pat)
    if pos >= 0:
        ctx = section[pos:pos+60]
        print(f"{pat}: found at {pos}: {ctx}")
    else:
        print(f"{pat}: NOT FOUND")
