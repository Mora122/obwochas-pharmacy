import os

html_dir = r'C:\Users\Administrator\.openclaw\workspace\obwochas-pharmacy'

# Pattern 1: "P.O. Box 79919-00100 Nairobi, Kenya" in contact info
old_postal = '79919-00100 Nairobi, Kenya'
new_postal = '79919-00100, Kisii, Kenya'

# Pattern 2: "Nairobi, Kenya" standalone on contact page
old_contact_city = '<p>Nairobi, Kenya</p>'
new_contact_city = '<p>Kisii, Kenya</p>'

# Pattern 3: schema.org "addressLocality": "Nairobi"
old_schema = '"addressLocality": "Nairobi"'
new_schema = '"addressLocality": "Kisii"'

updated = 0

for fname in os.listdir(html_dir):
    if not fname.endswith('.html'):
        continue
    path = os.path.join(html_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    orig = content
    content = content.replace(old_postal, new_postal)
    content = content.replace(old_contact_city, new_contact_city)
    content = content.replace(old_schema, new_schema)
    
    if content != orig:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated: {fname}')
        updated += 1

print(f'\nDone. {updated} file(s) updated.')
