"""Extract renderOrders function"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()
ss = d.find(b"function renderOrders")
se = d.find(b"}catch", ss)
if se < 0:
    se = d.find(b"function showAddProduct", ss)
# Find the next function definition
se = d.find(b"function showAddProduct", ss)
if se < 0:
    se = d.find(b"async function loadProducts", ss)
section = d[ss:se]
with open("goodlife-replica/renderOrders_deployed.txt", "wb") as f:
    f.write(section)
print(f"Extracted {len(section)} bytes")
