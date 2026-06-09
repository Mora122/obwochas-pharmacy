"""Extract full saveProduct function"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

idx = d.find("async function saveProduct")
if idx >= 0:
    # Find end of function (next function or outer close)
    end = d.find("}\n\n", idx)
    if end < 0: end = idx + 2000
    else: end = end + 1
    section = d[idx:end]
    print(section)
else:
    print("saveProduct not found!")
    
# Also check showEditProduct for image handling
idx = d.find("function showEditProduct")
if idx >= 0:
    end = d.find("}\n\n", idx)
    if end < 0: end = idx + 2000
    section = d[idx:end]
    with open("goodlife-replica/showEdit_func.txt", "w", encoding="utf-8") as f:
        f.write(section)
    print(f"\n\nshowEditProduct saved ({len(section)} chars)")
