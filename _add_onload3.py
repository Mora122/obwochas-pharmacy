import os

WORKSPACE = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'

# index.html pattern: onerror="this.src=\'images/placeholder.svg\'"
old_idx = b"onerror=\"this.src=\\'images/placeholder.svg\\'\""
new_idx = b"onerror=\"this.src=\\'images/placeholder.svg\\'\" onload=\"this.classList.add('loaded')\""

fpath = os.path.join(WORKSPACE, 'index.html')
with open(fpath, 'rb') as f:
    data = f.read()
count = data.count(old_idx)
if count > 0:
    data = data.replace(old_idx, new_idx)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('index.html: Added onload to %d image(s)' % count)
else:
    print('index.html: Pattern not found')

# product.html pattern: onerror="imgError(this)"
fpath = os.path.join(WORKSPACE, 'product.html')
with open(fpath, 'rb') as f:
    data = f.read()

old_prod = b'onerror="imgError(this)"'
new_prod = b'onerror="imgError(this)" onload="this.classList.add(\'loaded\')"'
count = data.count(old_prod)
if count > 0:
    data = data.replace(old_prod, new_prod)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('product.html: Added onload to %d image(s)' % count)
else:
    print('product.html: Pattern not found')

# Also add breadcrumb product name update
with open(fpath, 'rb') as f:
    data = f.read()

# After loadProduct fetches data, update breadcrumb
old_after_load = b"productName.textContent = p.name;"
if old_after_load in data:
    breadcrumb_js = b"productName.textContent = p.name;\n    var bc = document.getElementById('breadcrumbProduct'); if (bc) bc.textContent = p.name;"
    data = data.replace(old_after_load, breadcrumb_js)
    with open(fpath, 'wb') as f:
        f.write(data)
    print('product.html: Added breadcrumb name update')
else:
    print('product.html: Breadcrumb JS pattern not found')
