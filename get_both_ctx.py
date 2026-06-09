"""Get full context of both occurrences"""
with open("goodlife-replica/admin.html", "rb") as f:
    data = f.read()

# Find both occurrences
idx1 = data.find(b"<div class=\"prod-cat\">' + (p.category || '')", 20000)
idx2 = data.find(b"<div class=\"prod-cat\">' + (p.category || '')", idx1+5) if idx1 >= 0 else -1

for label, idx in [("First", idx1), ("Second", idx2)]:
    if idx < 0:
        print(f"{label}: not found")
        continue
    start = max(0, idx-200)
    end = min(len(data), idx+300)
    chunk = data[start:end].decode("utf-8", errors="replace")
    print(f"\n=== {label} at byte {idx} ===")
    print(chunk)
