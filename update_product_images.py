import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = 'https://obwochas-pharmacy.vercel.app/api/products'

# Image URLs by product ID
images = {
    'PROD-001': 'https://tmpfiles.org/dl/wlw5fPmln3x0/prod-001.png',
    'PROD-002': 'https://tmpfiles.org/dl/wHw5fQm8MBAc/prod-002.png',
    'PROD-003': 'https://tmpfiles.org/dl/wjwnfom6MwlQ/prod-003.png',
    'PROD-004': 'https://tmpfiles.org/dl/wZwxfnmsMsV4/prod-004.png',
    'PROD-005': 'https://tmpfiles.org/dl/wxwjfemAMAoG/prod-005.png',
    'PROD-006': 'https://tmpfiles.org/dl/wWwXfJm9MQ0p/prod-006.png',
    'PROD-007': 'https://tmpfiles.org/dl/w5wRfEmxM1js/prod-007.png',
    'PROD-008': 'https://tmpfiles.org/dl/w1wpf5mnM19a/prod-008.png',
    'PROD-009': 'https://tmpfiles.org/dl/wkwZf4mDMORI/prod-009.png',
    'PROD-010': 'https://tmpfiles.org/dl/wCwGfsmyM8Dk/prod-010.png',
    'PROD-011': 'https://tmpfiles.org/dl/w9wlfWmzM92K/prod-011.png',
    'PROD-012': 'https://tmpfiles.org/dl/w3wKfEmVMLGs/prod-012.png',
    'PROD-013': 'https://tmpfiles.org/dl/wzwsfdmnM0qN/prod-013.png',
    'PROD-014': 'https://tmpfiles.org/dl/wkwlfXmFM2Eu/prod-014.png',
    'PROD-015': 'https://tmpfiles.org/dl/wKwjfpmXU4ez/prod-015.png',
    'PROD-016': 'https://tmpfiles.org/dl/wJwWf8mUUqlu/prod-016.png',
    'PROD-017': 'https://tmpfiles.org/dl/wXwYf9m7U6Ze/prod-017.png',
    'PROD-018': 'https://tmpfiles.org/dl/w2wIflmLUVn5/prod-018.png',
    'PROD-019': 'https://tmpfiles.org/dl/wTwXf7mkUlHl/prod-019.png',
    'PROD-020': 'https://tmpfiles.org/dl/wCwfflmgU5dq/prod-020.png',
    'PROD-021': 'https://tmpfiles.org/dl/wNwAfBmYUg0z/prod-021.png',
    'PROD-022': 'https://tmpfiles.org/dl/wowQfkmwUk7V/prod-022.png',
    'PROD-023': 'https://tmpfiles.org/dl/wZwwfEmwUHtj/prod-023.png',
    'PROD-024': 'https://tmpfiles.org/dl/wvwQfEmDUda6/prod-024.png'
}

success = 0
fail = 0

for pid, url in images.items():
    try:
        resp = requests.patch(f'{BASE}?id={pid}', json={'image': url}, timeout=10)
        data = resp.json()
        if data.get('success'):
            success += 1
        else:
            print(f'FAIL {pid}: {data}')
            fail += 1
    except Exception as e:
        print(f'ERROR {pid}: {e}')
        fail += 1

print(f'\nUpdated: {success} products, Failed: {fail}')
