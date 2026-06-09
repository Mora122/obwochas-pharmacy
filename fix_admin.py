"""Fix admin.html - replace literal hex escapes with JS unicode escapes"""
path = "goodlife-replica/admin.html"

with open(path, "rb") as f:
    d = f.read()

# Replace literal text \xe2\xad\x90 (star as 12 ASCII chars) with \u2b50 (JS unicode escape)
old1 = b"\\xe2\\xad\\x90"   # 12 bytes in file: \x e 2 \x a d \x 9 0
new1 = b"\\u2b50"           # 6 bytes in file:  \u 2 b 5 0
count1 = d.count(old1)
print("Found", count1, "occurrences of \\xe2\\xad\\x90")
d = d.replace(old1, new1)

# Replace literal text \xf0\x9f\x94\xa5 (fire as 16 ASCII chars) with \ud83d\udd25
old2 = b"\\xf0\\x9f\\x94\\xa5"
new2 = b"\\ud83d\\udd25"
count2 = d.count(old2)
print("Found", count2, "occurrences of \\xf0\\x9f\\x94\\xa5")
d = d.replace(old2, new2)

# Verify no old patterns remain
print("Remaining \\xe2 at:", d.find(b"\\xe2"))
print("Remaining \\xf0 at:", d.find(b"\\xf0"))

# Verify new patterns present
print("\\u2b50 at:", d.find(b"\\u2b50"))
print("\\ud83d at:", d.find(b"\\ud83d"))

with open(path, "wb") as f:
    f.write(d)
print("Done - admin.html fixed")
