"""Verify all product images are in HTML and exist"""
import os, re

os.chdir(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica')

# Check shop.html
with open('shop.html', 'r', encoding='utf-8') as f:
    content = f.read()

imgs = re.findall(r'src="(images/[^"]+)"', content)
print('Images referenced in shop.html:')
all_ok = True
for img in imgs:
    exists = os.path.exists(img)
    size = os.path.getsize(img) if exists else 0
    status = 'OK' if exists else 'MISSING'
    if not exists:
        all_ok = False
    print(f'  {img} -> {status} ({size} bytes)')

print('\nAll images in /images folder:')
for f in sorted(os.listdir('images')):
    size = os.path.getsize(os.path.join('images', f))
    print(f'  {f} -> {size} bytes')

print('\n' + ('ALL GOOD!' if all_ok else 'SOME IMAGES MISSING!'))
