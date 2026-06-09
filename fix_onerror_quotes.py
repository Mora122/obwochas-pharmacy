"""Fix onerror quotes in image template"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Fix: replace onerror="this.style.display='none'" with onerror="this.style.display='none'"
# The issue is the single quotes inside single-quote JS string
# Solution: use onerror="this.remove()" instead or escape the quotes

old = """onerror="this.style.display='none'")""";
new = """onerror="this.parentElement.innerHTML=''")""";

if old in d:
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Fixed onerror quotes!")
else:
    print("Pattern not found, checking...")
    idx = d.find("onerror=")
    if idx >= 0:
        print(d[idx:idx+80])
