import urllib.request, json

# Get all products to find the ghost's _id
r = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/api/products?all=true')
data = json.loads(r.read())

for p in data.get('products', []):
    if p.get('id') == 'PROD-001' and p.get('name', '').strip().lower() == 'gh':
        print(f"Found ghost product:")
        for k, v in p.items():
            print(f"  {k}: {v}")
