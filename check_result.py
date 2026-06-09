"""Check admin.html after fix"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find flex:display occurrences
count = 0
idx = 0
while True:
    idx = d.find("flex:1;display:flex", idx)
    if idx < 0: break
    count += 1
    idx += 1
print(f"Found {count} instances of flex:1;display:flex")

# Check empty state
idx = d.find("No products found")
if idx >= 0:
    start = d.rfind("<div", 0, idx)
    end = d.find("</div>", idx) + 6
    section = d[start:end]
    print(f"\nEmpty state: {section[:200]}")

# Check product card template
idx = d.find('class="product-card"')
if idx >= 0:
    section = d[idx:idx+600]
    print(f"\nProduct card: {section[:300]}")
