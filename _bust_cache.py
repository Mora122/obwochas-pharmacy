"""Add cache-busting build version to admin.html and re-deploy."""
with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

import time
version = time.strftime('%Y%m%d%H%M%S')

# Update or add build version comment in <head>
old_version_comment = html[html.find('<!-- build:'):html.find('-->') + 3] if '<!-- build:' in html else ''
new_version_comment = f'<!-- build:{version} -->'

if old_version_comment:
    html = html.replace(old_version_comment, new_version_comment)
    print(f'Updated build version to {version}')
else:
    html = html.replace('<head>', f'<head>\n{new_version_comment}')
    print(f'Added build version {version}')

with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\admin.html', 'w', encoding='utf-8') as f:
    f.write(html)

print('Done')
