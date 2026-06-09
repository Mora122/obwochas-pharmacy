"""Fix onerror quotes - exact match"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

old = """onerror="this.style.display='none'"></div>' : '') +"""
new = """onerror="this.parentElement.innerHTML=''"></div>' : '') +"""

if old in d:
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Fixed!")
else:
    print(f"Not found. Looking...")
    idx = d.find("style.display")
    if idx >= 0:
        ctx = d[idx:idx+60]
        print(repr(ctx))
