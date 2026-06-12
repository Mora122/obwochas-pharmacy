import re

with open('prescription.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find form area
idx = c.find('<form')
print('Form area:', idx)
print(c[idx:idx+2500])
print('\n\n=== Remainder ===')
print(c[idx+2500:idx+3000])
