import os

html_dir = r'C:\Users\Administrator\.openclaw\workspace\obwochas-pharmacy'
old_box = '1852-00621'
new_box = '79919-00100'
updated = 0

for fname in os.listdir(html_dir):
    if not fname.endswith('.html') and fname != 'admin.html':
        continue
    path = os.path.join(html_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_box in content:
        content = content.replace(old_box, new_box)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {fname}')
        updated += 1

print(f'\nDone. {updated} file(s) updated.')
