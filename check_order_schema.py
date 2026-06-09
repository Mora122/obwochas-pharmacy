"""Check existing order schema and discount support"""
import urllib.request, json
resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/api/orders")
data = json.loads(resp.read())
if data.get("orders") and len(data["orders"]) > 0:
    order = data["orders"][0]
    print("Order fields:", list(order.keys()))
    print("\nSample order:")
    for k, v in order.items():
        print(f"  {k}: {repr(v)[:100]}")
else:
    print("Response keys:", list(data.keys()))
    print("Sample:", repr(data)[:500])
