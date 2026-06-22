import urllib.request, json

print('=== Re-seeding admin account ===')
r = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/api/login?seed=1', timeout=10)
print(r.read().decode()[:300])

print()
print('=== Testing login after re-seed ===')
data = json.dumps({'email': 'admin@obwochaspharmacy.co.ke', 'password': 'Admin@2026!'}).encode()
req = urllib.request.Request('https://obwochas-pharmacy.vercel.app/api/login', data=data, headers={'Content-Type': 'application/json'})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    d = json.loads(resp.read().decode())
    print(f'Success: {d.get("success")}, token: {bool(d.get("token"))}')
    
    print()
    print('=== Testing token access ===')
    token = d['token']
    req2 = urllib.request.Request('https://obwochas-pharmacy.vercel.app/api/orders', headers={'Authorization': 'Bearer ' + token})
    resp2 = urllib.request.urlopen(req2, timeout=10)
    d2 = json.loads(resp2.read().decode())
    print(f'Orders access: success={d2.get("success")}, count={d2.get("count")}')
except urllib.error.HTTPError as e:
    print(f'HTTP {e.code}: {e.read().decode()[:300]}')
