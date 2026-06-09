"""Check product images in API"""
import urllib.request, json
resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/api/products")
data = json.loads(resp.read())
for p in data["products"][:5]:
    img = p.get("image")
    print(f"{p['name']}: image={img}")
