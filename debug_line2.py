s = "'<button onclick=\"quickStock(' + \"'\" + p.id + \"'\" + ',-1)\" title=\"Remove 1\" style=\"padding:2px 6px;font-size:11px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:3px;cursor:pointer\">-1</button>' +"
print("repr:", repr(s))
print("text:", s)

# Encode to bytes
b = s.encode("utf-8")
print("bytes:", b)
print()
# Find quickStock area
idx = b.find(b"quickStock")
print("Around quickStock:", b[idx:idx+40])
