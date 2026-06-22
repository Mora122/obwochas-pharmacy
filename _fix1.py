import re

# ===== 1. Fix shop.html: conditional Add to Cart button =====
t = open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\shop.html', 'r', encoding='utf-8').read()

old_marker = 'class="btn btn-primary btn-sm" onclick="addToCart'
idx = t.find(old_marker)
if idx > 0:
    # Find exact snippet around the button
    start = t.rfind('View', idx - 300, idx)
    if start < 0:
        start = idx - 200
    end = t.find('</div></div></div>', idx)
    if end > 0:
        end = end + 19
    
    snippet = t[start:end]
    print('Found button region:')
    print(repr(snippet[:500]))
    print()
    
    # Build old and new with careful quoting
    # old: View button + Add to Cart button (always shown)
    old_part = '''<a href="product.html?id=' + p.id + '" class="btn btn-sm">View</a>' +
            '<button class="btn btn-primary btn-sm" onclick="addToCart(\'' + p.id + '\',\'' + p.name.replace(/'/g,"\\\\\'") + '\',' + p.price + ",'" + (p.image||'').replace(/'/g,"\\\\\'") + "')\">Add to Cart</button></div></div></div>\";"
    
    new_part = '''<a href="product.html?id=' + p.id + '" class="btn btn-sm">View</a>' +
            (p.stock > 0 ? '<button class="btn btn-primary btn-sm" onclick="addToCart(\\\'\' + p.id + \'\\\\\',\\\\\'\' + p.name.replace(/\'/g,\\\'\\\\\\\'\') + \'\\\\\',\' + p.price + \',\\\\\'\' + (p.image||\'\').replace(/\'/g,\\\'\\\\\\\'\') + \'\\\\\')\\\'>Add to Cart</button>\' : \'<button class="btn btn-sm" disabled style="background:#eee;color:#999;cursor:not-allowed">Out of Stock</button>\') + \'</div></div></div>\";'
    
    # Actually, this is getting too complex with escaping. Let me use a different approach.
    # Just do a simpler string replacement on the exact text.
    
    if old_part in t:
        t = t.replace(old_part, new_part)
        open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\shop.html', 'w', encoding='utf-8').write(t)
        print('OK shop.html updated')
    else:
        print('Pattern mismatch. Extracting exact text...')
        # Print the exact text around the button
        exact = t[idx:idx+500]
        print('EXACT TEXT:')
        # Show it in a way that's readable
        lines = exact.split('\n')
        for i, l in enumerate(lines):
            print(f'{i}: {repr(l)}')
else:
    print('Button not found!')
