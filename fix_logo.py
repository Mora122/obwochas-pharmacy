import os, glob
folder = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'
for fname in glob.glob(os.path.join(folder, '*.html')):
    with open(fname, 'r', encoding='utf-8') as f:
        text = f.read()
    orig = text
    text = text.replace('<div class="logo-icon">G</div>', '<div class="logo-icon">O</div>')
    if text != orig:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f'Updated logo in {os.path.basename(fname)}')
print('Done')
