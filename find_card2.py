"""Find product card in admin.html"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find product-card
idx = d.find("product-card")
if idx >= 0:
    # Go back to find the start of template string
    start = d.rfind("html += '", 0, idx)
    print(f"Template starts at {start}")
    # Show from there
    section = d[start:start+800]
    print(section[:800])
