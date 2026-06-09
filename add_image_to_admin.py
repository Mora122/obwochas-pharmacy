"""Fix admin product card to show image thumbnail"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the product card template - specifically the flex:1 section
old = """'<div style="flex:1">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>'"""

new = """'<div style="flex:1;display:flex;gap:10px">' +
        (p.image ? '<div style="width:50px;height:50px;flex-shrink:0;border-radius:6px;overflow:hidden;background:#f5f5f5"><img src="' + p.image + '" alt="' + p.name + '" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML=\'\'"></div>' : '') +
        '<div style="min-width:0">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>'"""

if old in d:
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Added image thumbnail to admin product card!")
else:
    print("OLD pattern not found - checking exact match...")
    # Debug: find the section
    idx = d.find("flex:1")
    if idx >= 0:
        section = d[idx:idx+300]
        print(repr(section))
