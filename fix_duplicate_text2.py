"""Fix duplicate text - works with CRLF"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the exact duplicate block
import re

# Pattern: the duplicate cat+desc lines followed by </div> + (which closes flex:1)
# We need to remove the cat+desc and replace with a closing </div> for min-width-0
old = """<div class="prod-cat">' + p.category + ' • ' + p.id + '</div>' +
      '<div style="font-size:11px;color:#555;margin-top:2px">' + (p.description ? p.description.substring(0, 120) + '...' : '') + '</div>' +
      '</div>' +"""

# Check how many times this appears
count = d.count(old)
print(f"Pattern found {count} times")

if count > 0:
    # The first occurrence is in the empty state template, NOT the product card
    # We need to replace both, but with slightly different context
    # Actually, the empty state also needs fixing but let's focus on product card first
    
    # Both occurrences have the same pattern - replace all
    # New text: close min-width-0, then close flex:1
    new = """</div>' +
      '</div>' +"""
    
    d2 = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d2)
    
    print(f"Replaced {count} occurrences")
    
    # Verify
    from js_check import check_error
    print("Checking JS syntax...")
else:
    print("Not found with CRLF. Checking raw bytes...")
    idx = d.find("prod-cat")
    if idx >= 0:
        ctx = d[idx:idx+250]
        print(f"Context: {ctx}")
