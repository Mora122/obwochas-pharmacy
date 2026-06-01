import os
folder = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica'
for f in sorted(os.listdir(folder)):
    if not f.endswith('.html'):
        continue
    path = os.path.join(folder, f)
    with open(path, 'r', encoding='utf-8') as fh:
        for i, line in enumerate(fh, 1):
            if 'Goodlife' in line:
                print(f'{f}:L{i}: {line.rstrip()[:120]}')
print('---DONE---')
