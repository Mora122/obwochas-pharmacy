with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

ss = 12304
se = 13993
section = d[ss:se]
with open("goodlife-replica/renderOrders_deploy.txt", "wb") as f:
    f.write(section)
print(len(section), "bytes")
