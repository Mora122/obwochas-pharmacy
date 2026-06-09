"""Fix admin product card - find renderProducts section first"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find renderProducts function
func_start = d.find("function renderProducts")
assert func_start >= 0, "renderProducts not found!"

# Find the product-card template string inside renderProducts
# Look for the first 'html +=' inside renderProducts
html_start = d.find("html += '", func_start)
assert html_start >= 0, "html template not found in renderProducts"

# Now find the 'flex:1' section within the template
flex_start = d.find("flex:1", html_start, html_start + 3000)
assert flex_start >= 0, "flex:1 not found in product template"

# Get the full '<div style="flex:1">' string
line_start = d.rfind("'<div", 0, flex_start)
line_end = d.find("'<div", line_start + 50)

old = d[line_start:line_end]
print(f"Products section ({len(old)} chars):")
print(old[:200])

new = """'<div style="flex:1;display:flex;gap:10px">' +
        (p.image ? '<div style="width:44px;height:44px;flex-shrink:0;border-radius:6px;overflow:hidden;background:#f0f0f0"><img src="' + p.image + '" alt="' + p.name + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"></div>' : '') +
        '<div style="min-width:0">' +
        '<div class="prod-name">' + p.name + '</div>' +
        '<div class="prod-cat">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +
        '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +
      '</div>' +"""

d = d.replace(old, new)

with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
    f.write(d)
print("\nImage thumbnail added to admin product card!")
