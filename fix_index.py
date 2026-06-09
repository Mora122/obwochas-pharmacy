"""Fix index.html - replace literal \xf0... with proper format in headline"""
with open("goodlife-replica/index.html", "rb") as f:
    d = f.read()

# Check for literal hex escapes in HTML (not JS context)
target = b"\\xf0\\x9f\\x94\\xa5 Special Offers"
idx = d.find(target)
if idx >= 0:
    context = d[idx:idx+40]
    print(f"Found: {repr(context)}")
    
    # These are literal characters in HTML which display as raw text
    # Replace with actual 🔥 emoji or just plain text
    # Since we're in HTML (not JS), just remove the literal escape chars
    fire_emoji = b"\\xf0\\x9f\\x94\\xa5 "  # Keep as-is since it's rendered as text
    
    # Actually, since this is in an HTML heading (<h2>), just remove it
    # The special offers section is now dynamic anyway
    d = d.replace(target, b"Special Offers")
    print("Fixed!")
else:
    print("Pattern not found, checking for other literal escapes...")
    for pat in [b"\\xf0", b"\\xe2", b"\\x9f", b"\\x94"]:
        idx = d.find(pat)
        if idx >= 0:
            print(f"  Found {repr(pat)} at {idx}: {repr(d[max(0,idx-10):idx+30])}")

with open("goodlife-replica/index.html", "wb") as f:
    f.write(d)
print("Done!")
