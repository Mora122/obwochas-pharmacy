import os, glob
for f in glob.glob('*.html'):
    with open(f,'r',encoding='utf-8') as fh:
        c = fh.read()
        if 'checkout.html' in c:
            print(f'{f}: found')
            # Find lines with checkout
            for i,line in enumerate(c.split('\n')):
                if 'checkout' in line.lower() and ('href' in line.lower() or 'onclick' in line.lower() or 'http' in line.lower()):
                    snippet = line[:120].encode('ascii','replace').decode()
                    print(f'  L{i}: {snippet}')
