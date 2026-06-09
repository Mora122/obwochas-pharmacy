"""Fix async function declarations"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Fix deleteProduct - add async
d = d.replace("function deleteProduct(id, name) {", "async function deleteProduct(id, name) {")

# Check saveProduct - it uses await but might already be async?
idx = d.find("function saveProduct()")
if idx >= 0:
    before = d[max(0,idx-20):idx+30]
    print(f"saveProduct context: {before}")

# Check toggleFeatured and toggleSpecial - these use PATCH with await
for func in ["toggleFeatured", "toggleSpecial"]:
    idx = d.find(f"function {func}")
    if idx >= 0:
        before = d[max(0,idx-10):idx+30]
        # Check if it has async
        is_async = d[max(0,idx-10):idx+10].find("async") >= 0
        print(f"{func}: {'async OK' if is_async else 'MISSING async'}")
        # Check if it uses await
        code_end = d.find("function ", idx+20)
        if code_end < 0:
            code_end = idx + 500
        code = d[idx:code_end]
        if "await" in code and not is_async:
            print(f"  -> Needs async!")
            d = d.replace(f"function {func}(", f"async function {func}(")

with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
    f.write(d)
print("\nFixed async declarations!")
