import urllib.request

req = urllib.request.Request('https://obwochas-pharmacy.vercel.app/', 
    headers={'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache'})
resp = urllib.request.urlopen(req, timeout=10)
html = resp.read().decode('utf-8')

terms = ['KSh 2,450', 'Payment Methods Showcase', '8942', '100% Secure', 'PCI Compliant']
for term in terms:
    found = term in html
    status = 'FOUND - NOT REMOVED' if found else 'OK - REMOVED'
    print('{}: {}'.format(term, status))

idx = html.find('Online Skin Consultation')
if idx >= 0:
    after = html[idx:idx+600]
    print('\nSection after Online Skin Consultation:')
    print(after)
