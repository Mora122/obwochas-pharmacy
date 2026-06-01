import re, os
d = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'
with open(os.path.join(d, 'shop.html'), 'r', encoding='utf-8') as f:
    html = f.read()
imgs = re.findall(r'<img[^>]+src="([^"]+)"', html)
print(f'Total <img> tags in shop.html: {len(imgs)}')
for i, img in enumerate(imgs):
    print(f'  {i+1}. {img}')
    
# Verify each image exists
for i, img in enumerate(imgs):
    path = os.path.join(d, img)
    if os.path.exists(path):
        sz = os.path.getsize(path)
        print(f'     EXISTS: {sz:,} bytes')
    else:
        print(f'     MISSING: not found')
