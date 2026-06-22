import os

WORKSPACE = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'

fpath = os.path.join(WORKSPACE, 'shop.html')
with open(fpath, 'rb') as f:
    data = f.read()

# shop.html uses double-quoted src attribute
old = b"<img src=\"' + p.image + '\" alt=\"' + p.name + '\""
new = b"<img loading=\"lazy\" src=\"' + p.image + '\" alt=\"' + p.name + '\""

if old in data:
    data = data.replace(old, new)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('shop.html: Added lazy loading to product images')
else:
    print('shop.html: Pattern not found')
    idx = data.find(b"<img src=")
    if idx >= 0:
        print('Found at', idx, repr(data[idx:idx+100]))

# Also add lazy to the placeholder image in the same template
old2 = b"'<img src=\"images/placeholder.svg\" alt=\"' + p.name + '\""
new2 = b"'<img loading=\"lazy\" src=\"images/placeholder.svg\" alt=\"' + p.name + '\""
if old2 in data:
    data = data.replace(old2, new2)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('shop.html: Added lazy to placeholder images')

print('Done')
