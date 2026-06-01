# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('admin.html', 'r', encoding='utf-8') as f:
    c = f.read()

old = (
    "html += '<div class=\"product-card\">' +\n"
    "      '<div style=\"flex:1\">' +\n"
    "        '<div class=\"prod-name\">' + p.name + '</div>' +\n"
    "        '<div class=\"prod-cat\">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +\n"
    "        '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +\n"
    "      '</div>' +"
)

new = (
    "var thumbImg = p.image ? '<img src=\"' + p.image + '\" style=\"width:40px;height:40px;object-fit:cover;border-radius:6px;margin-right:10px;flex-shrink:0\">' : '<div style=\"width:40px;height:40px;border-radius:6px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:20px;margin-right:10px;flex-shrink:0\">' + getCatIcon(p.category) + '</div>';\n"
    "    html += '<div class=\"product-card\">' +\n"
    "      '<div style=\"display:flex;align-items:center;flex:1\">' +\n"
    "        thumbImg +\n"
    "        '<div style=\"flex:1\">' +\n"
    "          '<div class=\"prod-name\">' + p.name + '</div>' +\n"
    "          '<div class=\"prod-cat\">' + (p.category || '') + ' \u2022 ' + p.id + '</div>' +\n"
    "          '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +\n"
    "        '</div>' +\n"
    "      '</div>' +"
)

if old in c:
    # Add getCatIcon function before the products code
    fns = (
        "function getCatIcon(cat) {\n"
        "  var m = {'Pain Relief':'\u26a1','Cold & Flu':'\U0001f927','Vitamins & Supplements':'\U0001f48a',"
        "'First Aid':'\U0001f979','Baby Care':'\U0001f931','Digestive Health':'\U0001fa01',"
        "'Allergy & Skin Care':'\U0001f9f4','Diabetes Care':'\U0001fa78'};\n"
        "  return m[cat] || '\U0001f48a';\n"
        "}\n\n"
    )
    
    # Insert function before the first product card generation
    insert_pos = c.find(old)
    before = c[:insert_pos]
    after = c[insert_pos:]
    c = before + fns + after
    c = c.replace(old, new, 1)
    
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(c)
    print('OK: Admin updated with product thumbnails!')
else:
    print('FAIL: Could not find exact text')
    # Debug
    idx = c.find('html +=')
    if idx >= 0:
        print('Found html += at position', idx)
        print('First 200 chars:', repr(c[idx:idx+200]))
