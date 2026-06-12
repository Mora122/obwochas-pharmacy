import urllib.request

req = urllib.request.Request('https://obwochas-pharmacy.vercel.app/service-worker.js',
    headers={'User-Agent': 'Mozilla/5.0'})
resp = urllib.request.urlopen(req, timeout=15)
content = resp.read().decode('utf-8', errors='replace')
idx = content.find('obwocha-v')
print('Version string:', content[idx:idx+13])
print('Cache-Control:', resp.getheader('Cache-Control', '?'))
print('Age:', resp.getheader('Age', '?'))
print('Content Length:', len(content))
print('Full content first 120 chars:', content[:120])
