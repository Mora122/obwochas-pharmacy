import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all addToCart patterns
for m in re.finditer(r'addToCart\([^)]+\)', content):
    snippet = content[m.start():m.end()]
    print(f'  idx={m.start()}: {repr(snippet)}')

# Check the specific problematic pattern
print("\n--- Looking for the double-quote pattern ---")
# Search for the exact byte pattern
for m in re.finditer(r"addToCart\('\"", content):
    print(f'Found " after escaping at idx={m.start()}')
    print(f'  Context: {repr(content[m.start():m.start()+80])}')

for m in re.finditer(r"\"'\),1\)", content):
    print(f'Found " before escaping at idx={m.start()}')
    print(f'  Context: {repr(content[max(0,m.start()-30):m.start()+30])}')
