import urllib.request, re, os

def search_direct_imgs(query, max_results=3):
    """Search for product images using a direct approach"""
    search_query = query.replace(' ', '+')
    url = f'https://www.google.com/search?tbm=isch&q={search_query}&tbs=isz:m'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode('utf-8', errors='replace')
        # Extract image URLs from Google search results
        # Google uses data-src or src attributes
        imgs = re.findall(r'(?:src|data-src)="(https?://[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"', html)
        # Filter for reasonable product images
        filtered = [i for i in imgs if 'encrypted-tbn' in i or 'gstatic' in i]
        return filtered[:max_results]
    except Exception as e:
        print(f'  Error: {e}')
        return []

# Try to directly access known product image CDN URLs
products_to_try = [
    ('wellman', [
        'https://www.vitabiotics.com/images/products/wellman-original-tablets-30s.png',
        'https://www.goodlife.co.ke/wp-content/uploads/2023/01/wellman-30-tablets.jpg',
    ]),
    ('cerave_cream', [
        'https://www.goodlife.co.ke/wp-content/uploads/2023/01/cerave-moisturizing-cream-454g.jpg',
        'https://www.cerave.com/-/media/project/loreal/brandwebsites/cerave/products/moisturizing-cream/700x875/cerave_moisturizing_cream_19oz_700x875-v3.jpg',
    ]),
    ('dettol', [
        'https://www.goodlife.co.ke/wp-content/uploads/2023/01/dettol-antiseptic-liquid-500ml.jpg',
    ]),
    ('pampers', [
        'https://www.goodlife.co.ke/wp-content/uploads/2023/01/pampers-premium-care-size-4-52s.jpg',
    ]),
]

for name, urls in products_to_try:
    print(f'\n--- {name} ---')
    for url in urls:
        print(f'Trying: {url}')
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=10)
            if resp.status == 200:
                ext = url.split('.')[-1].split('?')[0]
                fname = os.path.join(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images', f'{name}.{ext}')
                with open(fname, 'wb') as f:
                    f.write(resp.read())
                print(f'  DOWNLOADED: {fname} ({len(open(fname, "rb").read())} bytes)')
                break
        except Exception as e:
            print(f'  Failed: {type(e).__name__}')
