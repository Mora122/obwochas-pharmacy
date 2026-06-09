"""Find the image-related code in admin.html and products schema"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find image-related references
for i, line in enumerate(d.split("\n")):
    if "image" in line.lower() and ("url" in line.lower() or "src" in line.lower() or "img" in line.lower() or "upload" in line.lower() or "link" in line.lower() or "placeholder" in line.lower()):
        print(f"  L{i+1}: {line.strip()[:150]}")

print("\n--- Looking for edit modal ---")
idx = d.find("showEditProduct")
if idx >= 0:
    # Find the function
    end = d.find("function ", idx + 20)
    if end < 0: end = idx + 2000
    with open("goodlife-replica/showEditProduct.txt", "w", encoding="utf-8") as f:
        f.write(d[idx:end])
    print(f"showEditProduct written ({end-idx} chars)")

print("\n--- Looking for add modal ---")
idx = d.find("showAddProduct")
if idx >= 0:
    end = d.find("function", idx + 20)
    if end < 0: end = idx + 2000
    with open("goodlife-replica/showAddProduct.txt", "w", encoding="utf-8") as f:
        f.write(d[idx:end])
    print(f"showAddProduct written ({end-idx} chars)")
