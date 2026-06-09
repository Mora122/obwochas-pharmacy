"""Check exact bytes around the duplicate"""
with open("goodlife-replica/admin.html", "rb") as f:
    data = f.read()

# Find "(p.category || '')" around position 21000+
idx = data.find(b"(p.category || '')", 20500)
if idx >= 0:
    ctx = data[idx:idx+60]
    print(f"Found at byte {idx}")
    print(f"Hex: {ctx}")
    print(f"Decoded: {ctx.decode('utf-8', errors='replace')}")
    
# Also check for the second occurrence
idx2 = data.find(b"(p.category || '')", idx+10) if idx >= 0 else -1
if idx2 >= 0:
    ctx2 = data[idx2-10:idx2+60]
    print(f"\nSecond occurrence at byte {idx2}")
    print(f"Hex: {ctx2}")
    print(f"Decoded: {ctx2.decode('utf-8', errors='replace')}")
