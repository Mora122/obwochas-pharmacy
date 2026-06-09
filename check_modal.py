"""Check product management features"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

# Find product modal
idx = d.find('id="productModal"')
if idx >= 0:
    # Print the modal HTML (up to ~2000 chars)
    start = max(0, idx - 50)
    modal = d[start:start+2500]
    print("--- PRODUCT MODAL HTML ---")
    print(modal)

# Find saveProduct function
idx2 = d.find("function saveProduct")
if idx2 >= 0:
    end = d.find("function ", idx2+20)
    if end < 0:
        end = idx2 + 2000
    print("\n\n--- SAVEPRODUCT FUNCTION ---")
    print(d[idx2:min(end, idx2+2000)])

# Find showAddProduct
idx3 = d.find("function showAddProduct")
if idx3 >= 0:
    end = d.find("function ", idx3+20)
    if end < 0:
        end = idx3 + 1000
    print("\n\n--- SHOWADDPRODUCT FUNCTION ---")
    print(d[idx3:min(end, idx3+1000)])
