import re

with open('prescription.html', 'r', encoding='utf-8') as f:
    c = f.read()

idx = c.find('<form')
# Write to a text file instead of printing
with open('_presc_form_output.txt', 'w', encoding='utf-8') as out:
    out.write('=== FORM AREA ===\n')
    out.write(c[idx:idx+3000])
    out.write('\n\n=== SCRIPT ===\n')
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', c, re.DOTALL)
    for i, s in enumerate(scripts):
        if 'submit' in s.lower() or 'prescription' in s.lower() or 'form' in s.lower() or 'fetch' in s.lower():
            out.write(f'\n--- Script {i} ---\n')
            out.write(s)

print('Written to _presc_form_output.txt')
