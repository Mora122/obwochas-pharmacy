"""Fix the empty state template too - same duplicate issue"""
with open("goodlife-replica/admin.html", "rb") as f:
    data = f.read()

old_part = b"</div>' +'<div class=\"prod-cat\">' + (p.category || '') + ' \xe2\x80\xa2 ' + p.id + '</div>' +\r\n\r\n        '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +\r\n\r\n      '</div>' +"

# Count occurrences
print(f"Pattern found {data.count(old_part)} times")

# Replace all
new_part = b"</div>' +"
data = data.replace(old_part, new_part)

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(data)
print("Fixed both occurrences!")
