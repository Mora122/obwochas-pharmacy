import os

WORKSPACE = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'

# The exact bytes: onerror="this.onerror=null;this.src=\'images/placeholder.svg\'">
# In the JS template string, single quotes are escaped with backslash
old = b"onerror=\"this.onerror=null;this.src=\\'images/placeholder.svg\\'\">"
new = b"onerror=\"this.onerror=null;this.src=\\'images/placeholder.svg\\'\" onload=\"this.classList.add('loaded')\">"

for fname in ['shop.html', 'index.html', 'product.html']:
    fpath = os.path.join(WORKSPACE, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'rb') as f:
        data = f.read()
    count = data.count(old)
    if count > 0:
        data = data.replace(old, new)
        with open(fpath, 'wb') as f:
            f.write(data)
        print('%s: Added onload to %d image(s)' % (fname, count))
    else:
        print('%s: Pattern not found (%d occurrences of onerror)' % (fname, data.count(b'onerror=')))
