"""Fix duplicate - find exact context around position 3"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Get context around position 21100
pos = 21100
# Go back to find the start of the line
start = d.rfind("\n", 0, pos) + 1
end = d.find("\n", pos)
# Show more context
start2 = d.rfind("\n", 0, start-1)
end2 = d.find("\n", end+1) if end >= 0 else len(d)
print(f"Lines around pos {pos}:")
line_start = d.rfind("\n", 0, pos) + 1
line_end = d.find("\n", pos)
line = d[line_start:line_end]
print(f"Line: {repr(line)}")

# Show the block from pos-100 to pos+100
ctx_start = max(0, pos-200)
ctx_end = min(len(d), pos+200)
print(f"\nBlock at {ctx_start}-{ctx_end}:")
print(repr(d[ctx_start:ctx_end]))
