import os

ADMIN = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html'

with open(ADMIN, 'rb') as f:
    data = f.read()

# Search for "you're signed in as admin" — it might have different encoding
needle = b"Failed to load users. Make sure you"
if needle in data:
    idx = data.index(needle)
    print('Found at byte', idx)
    print(repr(data[idx:idx+130]))
else:
    print('Pattern not found')
    
    # Try searching for "signed in as admin"
    needle2 = b"signed in as admin"
    if needle2 in data:
        idx2 = data.index(needle2)
        print('Found alternative at byte', idx2)
        print(repr(data[idx2-30:idx2+100]))

# Also check the loadDashboard function for similar issues
needle3 = b"loadDashboard()"
if needle3 in data:
    print('loadDashboard found')
    
# Check for template literals that might cause issues
import re
for m in re.finditer(b"Failed to load", data):
    print('Failed to load at', m.start(), repr(data[max(0,m.start()-10):m.start()+100]))
