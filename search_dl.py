import urllib.request, re, os, sys

output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'
os.makedirs(output, exist_ok=True)

# All product URLs to try - using goodlife.co.ke and other sources
product_urls = [
    # CeraVe products (confirmed working)
    ('cerave_cream', 'https://www.goodlife.co.ke/product/cerave-moisturizing-cream-454g/'),
    ('cerave_lotion', 'https://www.goodlife.co.ke/product/cerave-daily-moisturizing-lotion-437-ml/'),
    
    # Try searching goodlife for more products
    ('wellman', 'https://www.goodlife.co.ke/product/wellman/'),
    ('dettol_antiseptic', 'https://www.goodlife.co.ke/product/dettol-antiseptic-liquid/'),
    ('pampers', 'https://www.goodlife.co.ke/product/pampers/'),
    ('colgate', 'https://www.goodlife.co.ke/product/colgate/'),
    ('nivea_sun', 'https://www.goodlife.co.ke/product/nivea-sun/'),
    ('seven_seas', 'https://www.goodlife.co.ke/product/seven-seas/'),
    ('optrex', 'https://www.goodlife.co.ke/product/optrex-eye-drops/'),
    ('piriton', 'https://www.goodlife.co.ke/product/piriton/'),
    ('brufen', 'https://www.goodlife.co.ke/product/brufen-400/'),
]

# Search on the goodlife site using the search endpoint
def search_and_get_image(search_term, output_name):
    """Search Goodlife site and get first product image"""
    try:
        search_url = f'https://www.goodlife.co.ke/?s={urllib.parse.quote(search_term)}&post_type=product'
        req = urllib.request.Request(search_url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        
        # Find first product link
        links = re.findall(r'<a href="(https://www\.goodlife\.co\.ke/product/[^"]+/)"', html)
        if links:
            product_url = links[0]
            print(f'  Found product: {product_url}')
            return get_image_from_product(product_url, output_name)
        return None
    except Exception as e:
        print(f'  Search error: {e}')
        return None

def get_image_from_product(url, output_name):
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        resp = urllib.request.urlopen(req, timeout=15)
        html = resp.read().decode('utf-8', errors='replace')
        
        # og:image
        m = re.search(r'property="og:image"[^>]+content="([^"]+)"', html)
        if m:
            return download_image(m.group(1), output_name)
        
        # wp-post-image
        m = re.search(r'class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"', html)
        if m:
            return download_image(m.group(1), output_name)
        
        # any uploads
        uploads = re.findall(r'https://[^"\']+wp-content/uploads/[^"\'\s]+\.(?:jpg|jpeg|png|webp)', html)
        if uploads:
            return download_image(uploads[0], output_name)
        
        return None
    except Exception as e:
        print(f'  Product fetch error: {e}')
        return None

def download_image(img_url, output_name):
    try:
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        resp = urllib.request.urlopen(req, timeout=15)
        data = resp.read()
        ext = 'jpg'
        if '.webp' in img_url:
            ext = 'webp'
        elif '.png' in img_url:
            ext = 'png'
        fname = os.path.join(output, f'{output_name}.{ext}')
        with open(fname, 'wb') as f:
            f.write(data)
        print(f'  DOWNLOADED: {len(data)} bytes -> {fname}')
        return fname
    except Exception as e:
        print(f'  Download error: {e}')
        return None

import urllib.parse

# Search for products on goodlife
searches = [
    ('wellman', 'Wellman tablets'),
    ('dettol_antiseptic', 'Dettol liquid antiseptic'),
    ('pampers', 'Pampers diapers'),
    ('colgate', 'Colgate toothpaste'),
    ('nivea_sun', 'Nivea Sun SPF sunscreen'),
    ('optrex', 'Optrex eye drops'),
    ('piriton', 'Piriton allergy tablets'),
    ('seven_seas', 'Seven Seas omega'),
    ('brufen', 'Brufen 400 ibuprofen'),
]

for name, term in searches:
    print(f'\n--- {name} (searching: {term}) ---')
    search_and_get_image(term, name)
