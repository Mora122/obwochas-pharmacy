"""Find the product card HTML template in JS"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find renderProducts function
idx = d.find("function renderProducts")
if idx < 0:
    idx = d.find("renderProducts")

# Look for product-card construction
pos = idx
while True:
    p = d.find("product-card", pos)
    if p < 0 or p > idx + 5000:
        break
    # Check if this is in JS (inside a string)
    before = d[max(0,p-200):p]
    after = d[p:p+300]
    print(f"--- At byte {p} ---")
    print(f"Before: ...{before[-100:]}")
    print(f"After: {after[:200]}")
    print()
    pos = p + 1
