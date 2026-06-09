"""Check if local file has the double-quote issue"""
import os

path = "goodlife-replica/admin.html"
with open(path, "rb") as f:
    d = f.read()

target = b"''<div"
idx = d.find(target)
if idx >= 0:
    print("FOUND double-'' in local file at byte", idx)
    print(repr(d[idx-60:idx+60]))
else:
    print("No double-'' in local file")
    # Check display:flex area
    idx2 = d.find(b"display:flex")
    print("display:flex at", idx2)
    print(repr(d[idx2-100:idx2+120]))
