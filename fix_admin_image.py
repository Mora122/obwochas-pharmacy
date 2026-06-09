"""Replace admin product card to show image thumbnail"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the section to replace - the first flex:1 div inside product-card
old_start = """<div style="flex:1">' +
      '<div class="prod-name">' + p.name + '</div>' +
      '<div class="prod-cat">' + (p.category || '') + ' """
# Unicode bullet - don't use f-string for this

old = """'<div style="flex:1">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>'"""

new = """'<div style="flex:1;display:flex;gap:10px">' +
        (p.image ? '<div style="width:44px;height:44px;flex-shrink:0;border-radius:6px;overflow:hidden;background:#f0f0f0"><img src="' + p.image + '" alt="' + p.name + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"></div>' : '') +
        '<div style="min-width:0">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>'"""

if old in d:
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Image thumbnail ADDED to admin product card!")
else:
    print("Pattern not found!")
    # Debug: show exact text at that location
    idx = d.find("product-card\">' +")
    if idx >= 0:
        section = d[idx:idx+500]
        with open("goodlife-replica/exact_match.txt", "w", encoding="utf-8") as f:
            f.write(section)
        print(f"Found product-card at {idx}, saved exact_match.txt")
    else:
        print("product-card template not found!")
