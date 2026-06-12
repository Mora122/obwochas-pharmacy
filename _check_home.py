import urllib.request

url = 'https://goodlife-replica.vercel.app'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
html = resp.read().decode('utf-8', errors='replace')

# Check homepage state
checks = [
    ('Easy Payment Options', 'Old generic card'),
    ('Payment Methods Showcase', 'Payment showcase section'),
    ('pm-mpesa', 'M-Pesa card in showcase'),
    ('payment-methods-grid', 'Payment methods grid'),
]
for marker, desc in checks:
    found = marker in html
    print(f'{"OK" if found else "MISSING"}: {desc}')

feat_count = html.count('feature-card')
print(f'Feature cards count: {feat_count}')
