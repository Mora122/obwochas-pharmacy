"""Download real product images from internet sources"""
import urllib.request, re, os, sys

output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'

def download_img(url, name):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/*,*/*;q=0.8'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read()
        # determine ext
        ext = 'jpg'
        ct = resp.headers.get('Content-Type', '')
        if 'png' in ct:
            ext = 'png'
        elif 'webp' in ct:
            ext = 'webp'
        elif 'gif' in ct:
            ext = 'gif'
        fname = os.path.join(output, name + '.' + ext)
        with open(fname, 'wb') as f:
            f.write(data)
        print(f'OK {name}: {len(data)} bytes -> {fname}')
        return fname
    except Exception as e:
        print(f'FAIL {name}: {e}')
        return None

def get_image_from_page(url, name):
    """Fetch a product page HTML and extract og:image or first large image"""
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        
        # og:image
        m = re.search(r'property="og:image"[^>]+content="([^"]+)"', html, re.I)
        if m:
            return download_img(m.group(1), name)
        
        # Open Graph image alternate format
        m = re.search(r'<meta[^>]+property=\'og:image\'[^>]+content=\'([^\']+)\'', html, re.I)
        if m:
            return download_img(m.group(1), name)
        
        # Try itemprop
        m = re.search(r'itemprop="image"[^>]+src="([^"]+)"', html, re.I)
        if m:
            return download_img(m.group(1), name)
        
        # Try wp-post-image
        m = re.search(r'class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"', html)
        if m:
            return download_img(m.group(1), name)
        
        # Any product image - look for common patterns
        # Find jpg/png URLs that look like product images
        imgs = re.findall(r'(https?://[^"\']+?/(?:uploads|images|media|pub|prod)/[^"\'\s]+\.(?:jpg|jpeg|png|webp))', html)
        # Filter for larger/better images
        good = [i for i in imgs if 'thumb' not in i.lower() and 'icon' not in i.lower() and 'logo' not in i.lower()]
        if good:
            return download_img(good[0], name)
        elif imgs:
            return download_img(imgs[0], name)
        
        print(f'  No image found at {url}')
        return None
    except Exception as e:
        print(f'  Error fetching {url}: {e}')
        return None

# === Download each missing product ===
print('=== Pampers Premium Care ===')
get_image_from_page('https://www.clicks.co.za/pampers_premium-care-nappies-size-4-52s/p/139004', 'pampers')

print('\n=== Brufen 400mg ===')
get_image_from_page('https://pharmily.co.ke/brufen-400mg-tablets-original-250s_4389', 'brufen')

print('\n=== Piriton Allergy Tablets ===')
get_image_from_page('https://www.superdrug.com/health/allergy-hayfever/hayfever-tablets/piriton-allergy-relief-tablets-antihistamine-tablets-30s/p/162263', 'piriton')

print('\n=== Nivea Sun SPF50 ===')
get_image_from_page('https://www.nivea.co.ke/products/protect-and-moisture-moisturising-sun-lotion-40058083955760056.html', 'nivea_sun')

print('\n=== Nivea Sun (Aggies Outlook - fallback) ===')
get_image_from_page('https://aggiesoutlook.co.ke/product/nivea-sun-protect-moisture-lotion-spf-50-200ml/', 'nivea_sun')

print('\n=== Sante Herbal Green Tea ===')
get_image_from_page('https://sokokuu.africa/beverages/sante-herbal-green-tea-rwandan-tea/', 'sante_tea')

print('\n=== Opti-Nutrition Whey Protein ===')
get_image_from_page('https://westerncosmetics.com/products/optimum-nutrition-whey-protein-powder', 'opti_whey')

print('\n--- Done ---')
