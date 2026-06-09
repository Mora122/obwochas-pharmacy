"""Fix duplicate text in admin product card template"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# The duplicate section: old name/cat/desc that appears after the new min-width-0 block
# We need to remove this specific duplicate block:
old_dup = """'<div class="prod-cat">' + p.category + ' • ' + p.id + '</div>' +
'<div style="font-size:11px;color:#555;margin-top:2px">' + p.description.substring(0, 120) + '...</div>' +
"""

# But we need to make sure we're only removing the DUPLICATE (which is the second occurrence)
# The template currently looks like:
# min-width-0 div > [NEW] name+cat+desc
# [OLD duplicate] cat+desc
# </div> (closes flex:1)

# Rebuild correctly: remove duplicate, add closing </div> for min-width-0
target = old_dup

if target in d:
    d = d.replace(target, "'</div>' +\n")
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Removed duplicate text and closed min-width-0 div!")
else:
    print("Target not found. Checking actual content...")
    # Find the second occurrence of cat+desc in the template area
    idx1 = d.find("font-size:11px;color:#555;margin-top:2px")
    if idx1 >= 0:
        print(f"1st font-size at {idx1}: {d[idx1-20:idx1+80]}")
    idx2 = d.find("font-size:11px;color:#555;margin-top:2px", idx1+1) if idx1 >= 0 else -1
    if idx2 >= 0:
        print(f"2nd font-size at {idx2}: {d[idx2-20:idx2+80]}")
