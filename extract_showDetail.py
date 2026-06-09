"""Extract full showOrderDetail"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()
idx = d.find("function showOrderDetail")
end = d.find("</script>", idx)
section = d[idx:end]
with open("goodlife-replica/showOrderDetail_full.txt", "w", encoding="utf-8") as f:
    f.write(section)
print(f"Saved: {len(section)} chars")
