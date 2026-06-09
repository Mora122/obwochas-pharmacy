"""Verify index.html doesn't have JS-invalid escapes"""
with open("goodlife-replica/index.html", "rb") as f:
    d = f.read()

# Check for literal hex escapes that would be invalid in JS strings
for pattern, name in [
    (b"\\xe2", "backslash-x-e-2"),
    (b"\\xad", "backslash-x-a-d"),
    (b"\\x90", "backslash-x-9-0"),
    (b"\\xf0", "backslash-x-f-0"),
    (b"\\x9f", "backslash-x-9-f"),
    (b"\\x94", "backslash-x-9-4"),
    (b"\\xa5", "backslash-x-a-5"),
]:
    pos = d.find(pattern)
    if pos >= 0:
        print(f"FOUND {name} at byte {pos}: {repr(d[pos:pos+30])}")
    else:
        print(f"OK - {name} not found")

# Check the \\u2605 escaping in JS
idx = d.find(b'\\u2605')
print(f"\n\\\\u2605 in file: {idx}")
if idx >= 0:
    print(repr(d[idx-20:idx+30]))

# Check \\ud83d\\udd25 in JS
idx2 = d.find(b'\\ud83d')
print(f"\\\\ud83d in file: {idx2}")
if idx2 >= 0:
    print(repr(d[idx2-20:idx2+40]))
