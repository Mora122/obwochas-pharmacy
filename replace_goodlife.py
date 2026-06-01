import os, re

base = r"C:\Users\Administrator\.openclaw\workspace\goodlife-replica"
files = [
    "about.html", "blog.html", "cart.html", "contact.html", "index.html",
    "product.html", "shop.html", "services.html", "faq.html",
    "health-conditions.html", "prescription.html", "store-locator.html",
    "account.html", "brands.html"
]

replacements = [
    (r'info@goodlife\.africa\.com', 'info@obwochaspharmacy.co.ke'),
    (r'ecommerce@goodlife\.africa\.com', 'orders@obwochaspharmacy.co.ke'),
    (r'enquiries@goodlife\.africa\.com', 'info@obwochaspharmacy.co.ke'),
    (r'facebook\.com/goodlifepharmacyafrica', 'facebook.com/obwochaspharmacy'),
    (r'instagram\.com/goodlifepharmacyafrica', 'instagram.com/obwochaspharmacy'),
    (r'twitter\.com/GoodlifeKE', 'twitter.com/obwochaspharmacy'),
    (r'linkedin\.com/company/goodlife---pharmacy-health-and-beauty', 'linkedin.com/company/obwochas-pharmacy'),
    (r'threads\.net/@goodlifepharmacyafrica', 'threads.net/@obwochaspharmacy'),
    (r'Goodlife Pharmacy & Health', "Obwocha's Pharmacy"),
    (r'Goodlife Pharmacy', "Obwocha's Pharmacy"),
    (r'Goodlife', "Obwocha's Pharmacy"),
    (r'goodlife\.africa\.com', 'obwochaspharmacy.co.ke'),
]

count = 0
for f in files:
    path = os.path.join(base, f)
    if not os.path.exists(path):
        print(f"❌ Not found: {f}")
        continue
    
    with open(path, 'r', encoding='utf-8') as fp:
        content = fp.read()
    
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content, flags=re.IGNORECASE)
    
    if content != original:
        with open(path, 'w', encoding='utf-8') as fp:
            fp.write(content)
        print(f'[OK] Updated: {f}')
        count += 1
    else:
        print(f'[SKIP] No changes: {f}')

print(f"\n{count} files updated")
