"""Download remaining product images from alternative sources"""
import urllib.request, re, os

output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'

def download_img(url, name):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read()
        ct = resp.headers.get('Content-Type', '')
        ext = 'jpg'
        if 'png' in ct: ext = 'png'
        elif 'webp' in ct: ext = 'webp'
        fname = os.path.join(output, name + '.' + ext)
        with open(fname, 'wb') as f:
            f.write(data)
        print(f'OK {name}: {len(data)} bytes')
        return fname
    except Exception as e:
        print(f'FAIL {name}: {e}')
        return None

def get_img_from_page(url, name):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        
        # og:image 
        m = re.search(r'property="og:image"[^>]+content="([^"]+)"', html, re.I)
        if m: return download_img(m.group(1), name)
        
        # itemprop image
        m = re.search(r'itemprop="image"[^>]+src="([^"]+)"', html, re.I)
        if m: return download_img(m.group(1), name)
        
        # data-src (lazy loading)
        m = re.search(r'class="[^"]*product[^"]*"[^>]+data-src="([^"]+)"', html, re.I)
        if m: return download_img(m.group(1), name)
        
        # Any uploads
        imgs = re.findall(r'(https?://[^"\']+?/uploads/[^"\'\s]+\.(?:jpg|jpeg|png|webp))', html)
        if imgs: return download_img(imgs[0], name)
        
        # Any image with product in URL
        imgs2 = re.findall(r'(https?://[^"\']+?/products/[^"\'\s]+\.(?:jpg|jpeg|png|webp))', html)
        if imgs2: return download_img(imgs2[0], name)
        
        # Any jpg/png from the same domain
        from urllib.parse import urlparse
        domain = urlparse(url).netloc
        all_imgs = re.findall(r'(https?://(?:[^/]+\.)?' + re.escape(domain) + r'[^"\']+\.(?:jpg|jpeg|png|webp))', html)
        if all_imgs: return download_img(all_imgs[0], name)
        
        print(f'  No image found at {url}')
        return None
    except Exception as e:
        print(f'  Error: {e}')
        return None

print('=== Pampers (Peekaboo Kenya) ===')
get_img_from_page('https://www.peekaboo.ke/products/pampers-premium-care-pants-size-4-44-pieces-9-14kg', 'pampers')

print('\n=== Pampers (Tawala Supermarket) ===')
get_img_from_page('https://www.tawalasupermarket.co.ke/baby-diapers/1340-pampers-premium-care-pants-maxi-244-size-4-8000050000370.html', 'pampers')

print('\n=== Piriton (Rowlands Pharmacy) ===')
get_img_from_page('https://shop.rowlandspharmacy.co.uk/products/piriton-tablets-4mg-30-tablets', 'piriton')

print('\n=== Sante Herbal Tea (Sokokuu - retry) ===')
get_img_from_page('https://sokokuu.africa/beverages/sante-herbal-green-tea-rwandan-tea/', 'sante_tea')

print('\n=== Done! ===')
