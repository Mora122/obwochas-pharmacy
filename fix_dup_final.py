"""Fix: remove the entire duplicate block, keep proper closings"""
# The issue: '</div>' +'<div class="prod-cat">'... (chained on same line)
# Need to replace the whole duplicate block with just '</div>' +

with open("goodlife-replica/admin.html", "rb") as f:
    data = f.read()

old_part = b"</div>' +'<div class=\"prod-cat\">' + (p.category || '') + ' \xe2\x80\xa2 ' + p.id + '</div>' +\r\n\r\n        '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +\r\n\r\n      '</div>' +"

new_part = b"</div>' +"

if old_part in data:
    data = data.replace(old_part, new_part)
    with open("goodlife-replica/admin.html", "wb") as f:
        f.write(data)
    print("Fixed! Removed duplicate cat+desc block")
else:
    print("Pattern not found. Trying partial match...")
    # Try finding the chained section
    idx = data.find(b"</div>' +'<div class=\"prod-cat\">'")
    if idx >= 0:
        context = data[idx:idx+300]
        print(f"Found chained section at {idx}")
        print(context.decode("utf-8", errors="replace"))
    else:
        print("Chained section not found either!")
