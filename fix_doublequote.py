"""Fix the double-quote issue at template boundary"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Search for ''<div style pattern  
target = b"''<div style=\"display:flex;gap:4px\">"
idx = d.find(target)
if idx >= 0:
    print(f"Found at byte {idx}")
    # Verify context
    before = d[idx-40:idx]
    print(f"Before: {repr(before)}")
    print(f"Match:  {repr(d[idx:idx+60])}")
    
    # Fix: remove one ' from the double
    fix = b"'<div style=\"display:flex;gap:4px\">"
    d = d.replace(target, fix)
    print(f"Fixed {d.count(fix)} occurrences")
    
    with open("goodlife-replica/admin.html", "wb") as f:
        f.write(d)
    print("Written!")
else:
    print("Pattern not found")
    # Search for any '' before display:flex
    idx2 = d.find(b"display:flex;gap:4px")
    if idx2 >= 0:
        print(f"display:flex at {idx2}")
        print(repr(d[idx2-10:idx2+30]))
