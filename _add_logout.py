with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

old = '    <div><span class="num" id="statDelivered">0</span>Delivered</div>\n\n  </div>\n\n</div>'
new = '    <div><span class="num" id="statDelivered">0</span>Delivered</div>\n    <button onclick="adminLogout()" style="margin-left:16px;background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);padding:6px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer">\U0001f512 Logout</button>\n  </div>\n\n</div>'

if old in html:
    html = html.replace(old, new, 1)
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('OK - Logout button added')
else:
    print('NOT FOUND - debugging...')
    import re
    m = re.search(r'Delivered[^<]*</div>', html)
    print(repr(m.group() if m else 'NO MATCH'))
