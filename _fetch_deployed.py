import urllib.request
r = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/prescription.html', timeout=10)
c = r.read().decode('utf-8')
with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\_deployed_html.txt', 'w', encoding='utf-8') as o:
    o.write(c)
print('Wrote deployed HTML, length:', len(c))
