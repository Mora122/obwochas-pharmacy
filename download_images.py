import urllib.request, re, os, sys

output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'
os.makedirs(output, exist_ok=True)

# Product URLs from goodlife.co.ke
product_urls = [
    ('cerave_cream', 'https://www.goodlife.co.ke/product/cerave-moisturizing-cream-454g/'),
    ('cerave_lotion', 'https://www.goodlife.co.ke/product/cerave-daily-moisturizing-lotion-437-ml/'),
    ('cerave_foam', 'https://www.goodlife.co.ke/product/cerave-foam-cleanser-473ml/'),
    ('cerave_pm', 'https://www.goodlife.co.ke/product/cerave-pm-facial-moisturizing-lotion-52-ml/'),
    ('cerave_am', 'https://www.goodlife.co.ke/product/cerave-am-facial-moisturizer-lotion-spf-30-52ml/'),
    ('cerave_retinol', 'https://www.goodlife.co.ke/product/cerave-resurfacing-retinol-serum-30ml/'),
]

def get_image_url(url):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        
        # Pattern 1: og:image meta tag
        m = re.search(r'property="og:image"[^>]+content="([^"]+)"', html)
        if m:
            return m.group(1)
        
        # Pattern 2: wp-post-image class
        m = re.search(r'class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"', html)
        if m:
            return m.group(1)
        
        # Pattern 3: any image in uploads
        uploads = re.findall(r'https://[^"\']+wp-content/uploads/[^"\'\s]+\.(?:jpg|jpeg|png|webp)', html)
        for u in uploads:
            if 'smush-webp' in u or 'uploads' in u:
                return u
        if uploads:
            return uploads[0]
        
        return None
    except Exception as e:
        print(f'ERROR fetching {url}: {e}', file=sys.stderr)
        return None

for name, url in product_urls:
    print(f'\n--- {name} ---')
    img = get_image_url(url)
    if img:
        print(f'  URL: {img}')
        try:
            req = urllib.request.Request(img, headers={'User-Agent': 'Mozilla/5.0'})
            resp = urllib.request.urlopen(req, timeout=15)
            data = resp.read()
            ext = 'jpg'
            if '.webp' in img:
                ext = 'webp'
            elif '.png' in img:
                ext = 'png'
            fname = os.path.join(output, f'{name}.{ext}')
            with open(fname, 'wb') as f:
                f.write(data)
            print(f'  DOWNLOADED: {len(data)} bytes')
        except Exception as e:
            print(f'  Download failed: {e}')
    else:
        print(f'  No image found')
