"""Replace renderOrders with fixed version (binary replacement)"""
with open("goodlife-replica/admin.html", "rb") as f:
    data = bytearray(f.read())

# Find the renderOrders function boundaries
ss = data.find(b"function renderOrders")
se = data.find(b"function updateOrderStats", ss)
print(f"Found renderOrders at {ss}-{se} ({se-ss} bytes)")

# Read the replacement
with open("goodlife-replica/renderOrders_fixed.txt", "rb") as f:
    new_bytes = f.read()

# Replace (note: new_bytes has \n, convert to \r\n for consistency)
new_bytes = new_bytes.replace(b"\n", b"\r\n")

# Also remove trailing \r\n (file has extra at end)
new_bytes = new_bytes.rstrip(b"\r\n")

data[ss:se] = new_bytes

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(data)

print(f"Replaced with {len(new_bytes)} bytes")
