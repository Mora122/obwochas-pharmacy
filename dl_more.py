"""Download remaining product images from goodlife.co.ke and create placeholders for the rest"""
import urllib.request, re, os, sys

output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'

def download_image(img_url, name):
    try:
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read()
        ext = 'jpg'
        if '.webp' in img_url.lower():
            ext = 'webp'
        elif '.png' in img_url.lower():
            ext = 'png'
        fname = os.path.join(output, f'{name}.{ext}')
        with open(fname, 'wb') as f:
            f.write(data)
        print(f'  OK {name}: {len(data)} bytes')
        return True
    except Exception as e:
        print(f'  FAIL {name}: {e}')
        return False

def get_product_image(url, name):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        
        # Try og:image
        m = re.search(r'property="og:image"[^>]+content="([^"]+)"', html)
        if m:
            return download_image(m.group(1), name)
        
        # Try wp-post-image
        m = re.search(r'class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"', html)
        if m:
            return download_image(m.group(1), name)
        
        # Any uploads image
        uploads = re.findall(r'(https://[^"\']+wp-content/uploads/[^"\'\s]+\.(?:jpg|jpeg|png|webp))', html)
        if uploads:
            # Prefer smush-webp or first non-small image
            for u in uploads:
                if 'smush-webp' in u or (not '-300x300' in u and not '-150x150' in u):
                    return download_image(u, name)
            return download_image(uploads[0], name)
        
        print(f'  No image found at {url}')
        return False
    except Exception as e:
        print(f'  Error fetching {url}: {e}')
        return False

# Try known/guessed product page URLs
try_list = [
    ('nivea_sun', 'https://www.goodlife.co.ke/product/nivea-sun-protect-moisture-spf50/'),
    ('piriton', 'https://www.goodlife.co.ke/product/piriton-allergy-tablets/'),
    ('brufen', 'https://www.goodlife.co.ke/product/brufen-400mg/'),
    ('pampers', 'https://www.goodlife.co.ke/product/pampers-premium-care-diapers/'),
]

print("=== Trying direct product URLs ===")
for name, url in try_list:
    print(f'\n{name}:')
    get_product_image(url, name)
