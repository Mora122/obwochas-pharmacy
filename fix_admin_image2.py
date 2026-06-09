"""Fix admin product card with exact text match"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the exact text
idx = d.find("product-card")
if idx >= 0:
    # The section starts after product-card line
    line_start = d.find("'<div style", idx)
    line_end = d.find("'<div style", line_start + 50)
    
    # Get exact old text
    old = d[line_start:line_end]
    print(f"Old text ({len(old)} chars):")
    print(repr(old[:200]))
    
    # Build new text with same start
    new_indent = "      "  # same indentation
    new = """'<div style="flex:1;display:flex;gap:10px">' +
        (p.image ? '<div style="width:44px;height:44px;flex-shrink:0;border-radius:6px;overflow:hidden;background:#f0f0f0"><img src="' + p.image + '" alt="' + p.name + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"></div>' : '') +
        '<div style="min-width:0">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>' +"""
    
    # Replace the text
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Done! Replaced.")
