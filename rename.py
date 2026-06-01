import os, glob, re

folder = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'
for fname in glob.glob(os.path.join(folder, '*.html')):
    with open(fname, 'r', encoding='utf-8') as f:
        text = f.read()
    orig = text
    
    # Replace brand name in all visible text (not URLs or file paths)
    text = text.replace('Goodlife <span>Pharmacy</span>', "Obwocha's <span>Pharmacy</span>")
    text = text.replace("Kenya's Largest Pharmacy Chain", "Meru's Own Pharmacy")
    text = text.replace('Goodlife Pharmacy Kenya', "Obwocha's Pharmacy")
    text = text.replace('The Goodlife Blog', "Obwocha's Health Blog")
    text = text.replace('My Goodlife Club', 'Obwocha\'s Health Club')
    
    # Title tags
    text = re.sub(r'<title>Goodlife', '<title>Obwocha', text)
    
    # Catch remaining 'Goodlife Pharmacy' references (not in URLs)
    text = re.sub(r'Goodlife Pharmacy(?!\w)', "Obwocha's Pharmacy", text)
    # Catch standalone 'Goodlife' (not in URLs/classes)
    text = re.sub(r'(?<=[\s>])Goodlife(?=[\s<])', 'Obwocha', text)
    text = re.sub(r'(?<=[\s>])Goodlife(?=\?)', 'Obwocha', text)
    
    if text != orig:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(text)
        print(f'[OK] Updated {os.path.basename(fname)}')
    else:
        print(f'  Skipped {os.path.basename(fname)}')
print('Done!')
