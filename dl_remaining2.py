"""Piriton and Sante Tea from Asset Pharmacy HTML"""
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
        return True
    except Exception as e:
        print(f'FAIL {name}: {e}')
        return False

# Get raw HTML from assetpharmacy for Piriton
print('=== Piriton (Asset Pharmacy) ===')
try:
    req = urllib.request.Request('https://assetpharmacy.com/product/piriton-4mg-tablets-10-tablets/', headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    resp = urllib.request.urlopen(req, timeout=15)
    html = resp.read().decode('utf-8', errors='replace')
    
    # Look for wp-post-image
    m = re.search(r'class="[^"]*wp-post-image[^"]*"[^>]+src="([^"]+)"', html)
    if m:
        print('  Found wp-post-image: ' + m.group(1))
        download_img(m.group(1), 'piriton')
    else:
        # Look for any uploads URLs with piriton in the path
        imgs = re.findall(r'(https://assetpharmacy\.com[^"\']+?uploads/[^"\'\s]+\.(?:jpg|jpeg|png|webp))', html)
        print(f'  Found {len(imgs)} upload images')
        for i in imgs:
            if 'piriton' in i.lower() or 'product' in i.lower():
                download_img(i, 'piriton')
                break
        else:
            if imgs:
                download_img(imgs[0], 'piriton')
            else:
                # Try any image tag
                all_imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
                for i in all_imgs:
                    if 'piriton' in i.lower():
                        download_img(i, 'piriton')
                        break
                else:
                    print('  No piriton images found')
                    # Print first few images for debugging
                    for i in all_imgs[:5]:
                        print(f'  Found img: {i}')
except Exception as e:
    print(f'  Error: {e}')

# Try to use web_fetch on Sante directly
print('\n=== Sante Tea (direct image approach) ===')
# Just search on Google for a Sante tea image URL
try:
    req = urllib.request.Request(
        'https://www.google.com/search?q=Sante+herbal+green+tea+product&tbm=isch',
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    )
    resp = urllib.request.urlopen(req, timeout=10)
    html = resp.read().decode('utf-8', errors='replace')
    # Find image URLs 
    imgs = re.findall(r'"https://[^"]+\.(?:jpg|jpeg|png)"', html)
    for i in imgs[:10]:
        url = i.strip('"')
        if 'sante' in url.lower() or 'tea' in url.lower() or 'herbal' in url.lower():
            print(f'  Trying: {url}')
            download_img(url, 'sante_tea')
            break
    else:
        print(f'  Found images but none matching. First 3:')
        for i in imgs[:3]:
            print(f'    {i}')
except Exception as e:
    print(f'  Error: {e}')

print('\n=== Done ===')
