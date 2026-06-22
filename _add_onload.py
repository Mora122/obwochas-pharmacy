import os

WORKSPACE = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'

onerror_str = "onerror=\"this.onerror=null;this.src='images/placeholder.svg'\""
onload_str = "onerror=\"this.onerror=null;this.src='images/placeholder.svg'\" onload=\"this.classList.add('loaded')\""

for fname in ['shop.html', 'index.html', 'product.html']:
    fpath = os.path.join(WORKSPACE, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    count = content.count(onerror_str)
    if count > 0:
        content = content.replace(onerror_str, onload_str)
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print('%s: Added onload to %d image(s)' % (fname, count))
    else:
        print('%s: Pattern not found' % fname)
