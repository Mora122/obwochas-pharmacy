"""Add low stock items list to summary"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find the inventory summary section
old = """document.getElementById('inventorySummary').innerHTML =

    '<strong>\U0001f4ca Inventory Summary</strong> \u2014 ' + allProducts.length + ' products across ' + catCount + ' categories &nbsp;|&nbsp; ' +

    '<span class="stock-ok">\u2705 ' + (allProducts.length - lowStock) + ' in stock</span> &nbsp;|&nbsp; ' +

    '<span class="stock-low">\u26a0\ufe0f ' + lowStock + ' low stock</span> &nbsp;|&nbsp; ' +

    '\U0001f4e6 ' + totalStock + ' total units';"""

new = """document.getElementById('inventorySummary').innerHTML =

    '<strong>\U0001f4ca Inventory Summary</strong> \u2014 ' + allProducts.length + ' products across ' + catCount + ' categories &nbsp;|&nbsp; ' +

    '<span class="stock-ok">\u2705 ' + (allProducts.length - lowStock) + ' in stock</span> &nbsp;|&nbsp; ' +

    '<span class="stock-low">\u26a0\ufe0f ' + lowStock + ' low stock</span> &nbsp;|&nbsp; ' +

    '\U0001f4e6 ' + totalStock + ' total units' +

    (lowStockItems.length > 0 ? '<div style="margin-top:10px;font-size:12px;line-height:1.6">' +
      '<strong style="color:#c62828">\u26a0\ufe0f Low Stock Items:</strong> ' +
      lowStockItems.join(' &nbsp;|&nbsp; ') +
    '</div>' : '');"""

if old in d:
    d = d.replace(old, new)
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Added low stock items list!")
else:
    print("Old summary pattern not found")
    # Debug: show what's actually there
    idx = d.find("inventorySummary")
    if idx >= 0:
        section = d[idx:idx+500]
        with open("goodlife-replica/summary_debug.txt", "w", encoding="utf-8") as out:
            out.write(section)
        print(f"Summary section at {idx}, written to summary_debug.txt")
