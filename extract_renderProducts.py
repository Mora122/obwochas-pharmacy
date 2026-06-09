with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()
ss = d.find(b"function renderProducts")
se = d.find(b"function showEditProduct", ss)
section = d[ss:se]
with open("goodlife-replica/renderProducts_current.txt", "wb") as f:
    f.write(section)
print(f"Extracted {len(section)} bytes")
