"""Debug: find exact text around View button."""
with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\shop.html', 'rb') as f:
    data = f.read()

text = data.decode('utf-8')

# Look for View product link 
idx = text.find('btn-sm\">View')
if idx >= 0:
    seg = text[idx-50:idx+500]
    # Print hex around it
    print(f'Found btn-sm View at byte offset {idx}')
    for i, line in enumerate(seg.split('\n')):
        print(f'{i}: {repr(line)}')
else:
    print('Not found, trying alternate search...')
    idx = text.find('btn-sm')
    if idx >= 0:
        print(f'First btn-sm at {idx}:')
        print(repr(text[idx:idx+200]))
