"""Fix onerror to avoid quote issues entirely"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Use this.remove() which has no quotes
old = """onerror="this.parentElement.innerHTML=''"></div>' : '') +"""
new = """onerror="this.remove()"></div>' : '') +"""

if old in d:
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Fixed!")
else:
    print("Pattern not found, showing context:")
    idx = d.find("remove")
    if idx >= 0:
        print(d[idx-30:idx+40])
    else:
        idx = d.find("onerror")
        if idx >= 0:
            print(d[idx:idx+80])
