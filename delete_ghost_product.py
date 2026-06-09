import urllib.request, json, sys

# Delete the ghost product by _id
ghost_id = '6a27fa6882c93844d784c8ae'
data = json.dumps({'_id': ghost_id}).encode('utf-8')
req = urllib.request.Request(
    'https://obwochas-pharmacy.vercel.app/api/products',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='DELETE'
)
try:
    r = urllib.request.urlopen(req)
    result = json.loads(r.read())
    print(f"Delete result: {json.dumps(result, indent=2)}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}: {e.read().decode()}")
except Exception as e:
    print(f"Error: {e}")
