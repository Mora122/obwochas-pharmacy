"""Find exact duplicate pattern"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the second font-size section after flex:1
idx = d.find("font-size:11px;color:#555;margin-top:2px")
positions = []
while idx >= 0:
    positions.append(idx)
    idx = d.find("font-size:11px;color:#555;margin-top:2px", idx+1)

print(f"Found {len(positions)} occurrences:")
for i, pos in enumerate(positions):
    ctx = d[pos-50:pos+150]
    print(f"\n--- Occurrence {i+1} at pos {pos} ---")
    print(repr(ctx.strip()))
