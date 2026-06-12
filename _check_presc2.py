import re

with open('prescription.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find the full form tag
m = re.search(r'<form[^>]*>', c)
if m:
    print('Form tag:', m.group())

# Find Web3Forms or similar hidden fields
hidden = re.findall(r'<input[^>]*hidden[^>]*>', c)
for h in hidden:
    print('Hidden:', h[:200])

# Check scripts for "no prescription" text
if 'no prescription' in c.lower():
    idx = c.lower().find('no prescription')
    print(f'\n"no prescription" found at {idx}')
    print(c[max(0,idx-200):idx+200])

# Check for validation logic
scripts = re.findall(r'<script[^>]*>(.*?)</script>', c, re.DOTALL)
for i, s in enumerate(scripts):
    if 'prescription' in s.lower() or 'file' in s.lower():
        print(f'\n=== Script {i} ({len(s)} chars) ===')
        print(s[:200])
