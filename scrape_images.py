import urllib.request, re, os

folder = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'

# Product pages from the real Goodlife Pharmacy website
products = [
    ('cerave_cream', 'https://www.goodlife.co.ke/product/cerave-moisturizing-cream-454g/'),
    ('wellman', 'https://www.goodlife.co.ke/product/wellman-original/'),
    ('dettol', 'https://www.goodlife.co.ke/product/dettol-antiseptic-disinfectant/'),
    ('pampers', 'https://www.goodlife.co.ke/product/pampers-premium-care/'),
    ('colgate', 'https://www.goodlife.co.ke/product/colgate-total-100ml/'),
    ('nivea_sun', 'https://www.goodlife.co.ke/product/nivea-sun-spf50/'),
]

def find_images(url, max_imgs=5):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
        resp = urllib.request.urlopen(req, timeout=10)
        html = resp.read().decode('utf-8', errors='replace')
        
        # Find image URLs
        imgs = re.findall(r'https?://[^"\'\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"\'\s]*)?', html)
        
        # Also check for WooCommerce gallery images (wp-content/uploads)
        product_imgs = [i for i in imgs if 'wp-content/uploads' in i and 'woocommerce_thumbnail' in i or 'woocommerce_single' in i or 'woocommerce_gallery' in i or 'uploads' in i]
        product_imgs = product_imgs[:max_imgs]
        
        if not product_imgs:
            # Try srcset and data-src
            lazy = re.findall(r'data-src="([^"]+)"', html)
            for l in lazy:
                if 'uploads' in l and l not in product_imgs:
                    product_imgs.append(l)
        
        return product_imgs
    except Exception as e:
        print(f'  Error: {e}')
        return []

for name, url in products:
    print(f'\n{name}:')
    print(f'  URL: {url}')
    imgs = find_images(url)
    for img in imgs:
        print(f'  IMG: {img}')
