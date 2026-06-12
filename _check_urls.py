import urllib.request

urls = [
    ('obwochas-pharmacy.vercel.app', 'https://obwochas-pharmacy.vercel.app'),
    ('goodlife-replica.vercel.app',   'https://goodlife-replica.vercel.app'),
]

for name, url in urls:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode('utf-8', errors='replace')
    showcase = 'Payment Methods Showcase' in html
    old_card = 'Easy Payment Options' in html
    feat_count = html.count('feature-card')
    cache_hdr = resp.headers.get('X-Vercel-Cache', '?')
    print(f'{name}:')
    print(f'  Showcase: {showcase}, Old card: {old_card}, Features: {feat_count}')
    print(f'  Cache: {cache_hdr}')
