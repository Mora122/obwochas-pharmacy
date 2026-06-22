import os

WORKSPACE = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'

# Add loading="lazy" to shop.html product images
fpath = os.path.join(WORKSPACE, 'shop.html')
with open(fpath, 'rb') as f:
    data = f.read()

old_img = b"var imgHtml = p.image ? '<img src='"
new_img = b"var imgHtml = p.image ? '<img loading=\"lazy\" src='"

if old_img in data:
    data = data.replace(old_img, new_img)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('shop.html: Added lazy loading')
else:
    print('shop.html: Pattern not found')
    idx = data.find(b'var imgHtml')
    if idx >= 0:
        print('Found at:', idx, repr(data[idx:idx+100]))

# Add loading="lazy" to index.html product images too
fpath = os.path.join(WORKSPACE, 'index.html')
with open(fpath, 'rb') as f:
    data = f.read()

old_idx_img = b"var html = '<div class=\"product-card\""
new_idx_img = b"var html = '<div loading=\"lazy\" class=\"product-card\""

# Actually let me add loading to the img tags themselves
old_idx_img2 = b"<img src='"
new_idx_img2 = b"<img loading='lazy' src='"

if old_idx_img2 in data:
    data = data.replace(old_idx_img2, new_idx_img2)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('index.html: Added lazy loading')
else:
    # Check what the actual pattern is
    idx = data.find(b'<img')
    if idx >= 0:
        print('index.html first img:', repr(data[idx:idx+120]))

# Also add to product.html
fpath = os.path.join(WORKSPACE, 'product.html')
with open(fpath, 'rb') as f:
    data = f.read()

# Check for img tags in JS
idx = data.find(b'<img src=')
if idx >= 0:
    print('product.html img tag:', repr(data[idx:idx+120]))

print('Done')
