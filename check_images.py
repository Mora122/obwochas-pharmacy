"""Check which products have images"""
import urllib.request, json
resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/api/products")
data = json.loads(resp.read())
without = [p for p in data["products"] if not p.get("image")]
print(f"Products without image: {len(without)}")
for p in without:
    print(f"  {p['id']}: {p['name']}")
print()
with_img = [p for p in data["products"] if p.get("image")]
print(f"Products WITH image: {len(with_img)}")
for p in with_img[:5]:
    print(f"  {p['id']}: {p['name']} -> {p['image'][:60]}")
