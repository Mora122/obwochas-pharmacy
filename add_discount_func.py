"""Add giveDiscount function via binary insertion"""
with open("goodlife-replica/admin.html", "rb") as f:
    data = bytearray(f.read())

marker = b"}\r\n\r\n/* ========= PRODUCTS ========= */"
idx = data.find(marker)
if idx < 0:
    # Try with just }
    marker = b"}\r\n\r\n/* ========= PRODUCTS ========= */"
    print("Searching...")
    # Search for "/* ========= PRODUCTS ========= */"
    idx2 = data.find(b"/* ========= PRODUCTS ========= */")
    if idx2 >= 0:
        print(f"Found marker at {idx2}")
        # Go back to find the closing }
        back = data.rfind(b"}", 0, idx2)
        print(f"Closing brace at {back}")
        idx = back
        marker = data[back:idx2+len(b"/* ========= PRODUCTS ========= */")]
        print(f"Marker: {repr(marker[:50])}")
    else:
        print("Marker not found!")

# Read function from separate file
with open("goodlife-replica/give_discount_func.txt", "r") as f:
    func_text = f.read()

func_bytes = func_text.replace("\n", "\r\n").encode("utf-8")

# Replace marker with marker + func
new_data = data[:idx] + b"}" + func_bytes + data[idx+1:]

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(new_data)

print(f"Done! Inserted {len(func_bytes)} bytes")
