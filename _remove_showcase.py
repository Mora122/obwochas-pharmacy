import sys
sys.stdout.reconfigure(encoding='utf-8')

import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find section boundaries
start = html.find('<!-- Payment Methods Showcase')
end = html.find('</section>', start) + len('</section>')

print(f'Start: {start}')
print(f'End: {end}')
print(f'Length: {end - start}')

# Verify end: should be followed by Categories or similar
print('AFTER END:')
print(repr(html[end:end+100]))

# Remove the section
new_html = html[:start] + html[end:]

print(f'\nOld length: {len(html)}')
print(f'New length: {len(new_html)}')
print(f'Removed: {len(html) - len(new_html)} chars')

with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print('\n✅ Removed!')

# Verify
with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\index.html', 'r', encoding='utf-8') as f:
    verify = f.read()

# Check if showcase content is gone
for term in ['KSh 2,450', 'Payment Showcase', 'Visa & Mastercard', '8942', '100% Secure', 'PCI Compliant']:
    idx = verify.find(term)
    print(f'{term}: {"❌ FOUND at " + str(idx) if idx >= 0 else "✅ REMOVED"}')
