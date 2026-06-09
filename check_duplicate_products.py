import urllib.request, json

r = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/api/products?all=true')
data = json.loads(r.read())
products = data.get('products', [])

ids = {}
for p in products:
    pid = p.get('id', 'none')
    if pid not in ids:
        ids[pid] = []
    ids[pid].append(p['name'])

print('=== Duplicate IDs ===')
for pid, names in ids.items():
    if len(names) > 1:
        print(f'  {pid}: {names}')

print()
print('=== Weird products (short name, test data) ===')
for p in products:
    name = (p.get('name') or '').strip()
    if not name or len(name) < 3 or name.lower() in ('gh', 'test', 'hjhjooppp', 'oaib'):
        print(f'  id={p.get("id")} name="{name}" desc="{p.get("description","")}" cat="{p.get("category")}" stock={p.get("stock")} price={p.get("price")}')
