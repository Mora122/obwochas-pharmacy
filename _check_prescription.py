import re, sys

with open('prescription.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find script tags with submission logic
scripts = re.findall(r'<script[^>]*>(.*?)</script>', c, re.DOTALL)
for i, s in enumerate(scripts):
    low = s.lower()
    if 'submit' in low or 'prescription' in low or 'form' in low or 'fetch' in low:
        sys.stdout.reconfigure(encoding='utf-8')
        print(f'\n=== Script {i} ({len(s)} chars) ===')
        print(s[:2000])
        sys.stdout.reconfigure(encoding='cp1252')
