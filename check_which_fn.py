"""Check context around both template occurrences"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

for pos in [12446, 20343]:
    # Go backwards to find the function name
    start = max(0, pos - 500)
    pre = d[start:pos]
    fn_name = ""
    if "renderOrders" in pre:
        fn_name = "renderOrders"
    elif "renderProducts" in pre:
        fn_name = "renderProducts"
    elif "el.innerHTML" in pre:
        fn_name = "el.innerHTML (empty state)"
    else:
        fn_name = "unknown"
    print(f"Position {pos}: in {fn_name}")
    print(f"  Context: {d[pos:pos+80]}")
    print()
