import requests, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'https://obwochas-pharmacy.vercel.app/api/products'

# Update all 24 products to use permanent Vercel-hosted image URLs
success = 0
for i in range(1, 25):
    pid = f'PROD-{i:03d}'
    local_url = f'https://obwochas-pharmacy.vercel.app/images/products/{pid}.png'
    try:
        resp = requests.patch(f'{BASE}?id={pid}', json={'image': local_url}, timeout=10)
        data = resp.json()
        if data.get('success'):
            success += 1
        else:
            print(f'FAIL {pid}: {data}')
    except Exception as e:
        print(f'ERROR {pid}: {e}')

print(f'\nUpdated {success}/24 products to use Vercel image URLs')
