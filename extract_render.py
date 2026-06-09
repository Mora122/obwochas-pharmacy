"""Look at the renderProducts function structure"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("function renderProducts")
if idx >= 0:
    end = d.find("function ", idx + 30)
    if end < 0:
        end = idx + 4000
    section = d[idx:end]
    with open("goodlife-replica/renderProducts_full.txt", "w", encoding="utf-8") as out:
        out.write(section)
    print(f"Written {len(section)} chars")
