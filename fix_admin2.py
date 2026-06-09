"""Fix admin.html - remove spurious \' that breaks JS string termination"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Find the buttons section and fix the broken escapes
idx = d.find(b"showEditProduct")
section_start = d.rfind(b"<div style=", 0, idx)
section_end = d.find(b"</div></div>", section_start) + len(b"</div></div>")

section = d[section_start:section_end]
print("Current section:")
print(repr(section[:300]))

# The fix: replace the current section with properly terminated strings
# Pattern should be:
# '...Edit</button>' +           <- string closed with ', then + concat
# (p.featured ? '...' : '...') + <- ternary expression, strings inside
# (p.specialOffer ? '...' : '...') +
# '<button...>Del</button>' +
# '</div></div>';

new_section = (
    b'<div style="display:flex;gap:4px">\' +\r\r\n'
    b'        \'<button class="btn btn-primary" onclick="showEditProduct(\'\' + p.id + \'\\\')" style="font-size:11px;padding:6px 12px">Edit</button>\' +\r\r\n'
    b'        (p.featured ? \'<button onclick="toggleFeatured(\'\' + p.id + \'\\\',false)" style="font-size:11px;padding:6px 10px;background:#e8f5e9;color:#2e7d32;border:1px solid #2e7d32;border-radius:4px;cursor:pointer">\\u2b50 Featured</button>\' : \'<button onclick="toggleFeatured(\'\' + p.id + \'\\\',true)" style="font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer">\\u2b50 Feature</button>\') +\r\r\n'
    b'        (p.specialOffer ? \'<button onclick="toggleSpecial(\'\' + p.id + \'\\\',false)" style="font-size:11px;padding:6px 10px;background:#fff3e0;color:#e65100;border:1px solid #e65100;border-radius:4px;cursor:pointer">\\ud83d\\udd25 On Sale</button>\' : \'<button onclick="toggleSpecial(\'\' + p.id + \'\\\',true)" style="font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer">\\ud83d\\udd25 Offer</button>\') +\r\r\n'
    b'        \'<button class="btn" onclick="deleteProduct(\'\' + p.id + \'\\\',\'\' + p.name.replace(/\'/g,"\\\\\'") + \'\\\')" style="font-size:11px;padding:6px 12px;background:#ffebee;color:#c62828;border:none;border-radius:4px;cursor:pointer">Del</button>\' +\r\r\n'
    b'      \\\'</div></div>'
)

d = d[:section_start] + new_section + d[section_end:]

with open("goodlife-replica/admin.html", "wb") as f:
    f.write(d)

print("\nFixed! Verifying...")
# Show the fixed section
idx = d.find(b"showEditProduct")
section_start = d.rfind(b"<div style=", 0, idx)
print(repr(d[section_start:section_start+400]))
