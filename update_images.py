"""Update HTML files to replace emoji placeholders with real product images"""
import re

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def update_html_files():
    # ===== SHOP.HTML =====
    with open(r'goodlife-replica\shop.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Map emojis to image filenames
    replacements = {
        '\U0001f48a': 'images/wellman.png',        # pill
        '\U0001f9f4': 'images/cerave_cream.jpg',   # lotion
        '\U0001f931': 'images/pampers.jpg',        # baby
        '\U0001fa79': 'images/dettol_antiseptic.jpg', # bandage
        '\U0001f33f': 'images/sante_tea.jpg',      # herb
        '\U0001f9b7': 'images/colgate.jpg',        # tooth
        '\U0001f4aa': 'images/opti_whey.jpg',      # muscle
        '\u2764\ufe0f': 'images/seven_seas.jpg',   # heart
        '\U0001f441\ufe0f': 'images/optrex.jpg',   # eye
        '\U0001f927': 'images/piriton.jpg',        # sneeze
        '\u26a1': 'images/brufen.jpg',             # lightning
    }
    
    for emoji, img_path in replacements.items():
        old = '<div class="product-img">' + emoji + '</div>'
        new = '<div class="product-img"><img src="' + img_path + '" alt="" style="width:100%;height:100%;object-fit:contain;"></div>'
        if old in content:
            content = content.replace(old, new)
            print('Replaced ' + emoji + ' in shop.html')
        else:
            print('NOT FOUND: ' + emoji + ' in shop.html')
    
    with open(r'goodlife-replica\shop.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('shop.html updated!')
    
    # ===== INDEX.HTML =====
    with open(r'goodlife-replica\index.html', 'r', encoding='utf-8') as f:
        index_html = f.read()
    
    for emoji, img_path in replacements.items():
        old = '<div class="product-img">' + emoji + '</div>'
        new = '<div class="product-img"><img src="' + img_path + '" alt="" style="width:100%;height:100%;object-fit:contain;"></div>'
        if old in index_html:
            index_html = index_html.replace(old, new)
    
    with open(r'goodlife-replica\index.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print('index.html updated!')
    
    # ===== PRODUCT.HTML =====
    with open(r'goodlife-replica\product.html', 'r', encoding='utf-8') as f:
        prod_html = f.read()
    
    # Find the product-main-image div and replace its content
    pattern = r'<div class="product-main-image">[^<]*([^<]*)</div>'
    def replace_main(match):
        inner = match.group(1).strip()
        # Default to wellman if we can't match
        img_src = 'images/wellman.png'
        # We'll replace with a data-attribute approach
        return '<div class="product-main-image"><img src="' + img_src + '" alt="Product" style="width:100%;height:100%;object-fit:contain;" id="mainProductImage"></div>'
    
    prod_html = re.sub(pattern, replace_main, prod_html)
    
    # Add JavaScript to dynamically change product image based on URL param
    script = '''
<script>
// Dynamic product image by ID from URL
(function() {
  const products = {
    1: 'images/wellman.png',
    2: 'images/cerave_cream.jpg',
    3: 'images/pampers.jpg',
    4: 'images/dettol_antiseptic.jpg',
    5: 'images/sante_tea.jpg',
    6: 'images/colgate.jpg',
    7: 'images/opti_whey.jpg',
    8: 'images/nivea_sun.jpg',
    9: 'images/seven_seas.jpg',
    10: 'images/optrex.jpg',
    11: 'images/piriton.jpg',
    12: 'images/brufen.jpg'
  };
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id && products[id]) {
    const img = document.getElementById('mainProductImage');
    if (img) img.src = products[id];
  }
})();
</script>
'''
    
    # Insert before </body>
    prod_html = prod_html.replace('</body>', script + '\n</body>')
    
    with open(r'goodlife-replica\product.html', 'w', encoding='utf-8') as f:
        f.write(prod_html)
    print('product.html updated!')
    
    print('\nAll HTML files updated with product images!')

if __name__ == '__main__':
    import os
    os.chdir(r'C:\Users\Administrator\.openclaw\workspace')
    update_html_files()
