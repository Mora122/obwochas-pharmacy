"""Rewrite product card template - CRITICAL: use proper JS string termination.
Rules:
- Lines ending with string: end with ' + (just quote, no backslash)
- Ternary expressions: start WITHOUT opening quote, end with ) +
- Lines starting new string: just ' (no backslash prefix)
"""
import os

path = os.path.join("goodlife-replica", "admin.html")
with open(path, "rb") as f:
    data = f.read()

idx_start = data.find(b"showEditProduct")
section_start = data.rfind(b"display:flex", 0, idx_start)
div_start = data.rfind(b"<div", 0, section_start)
section_end = data.find(b"</div></div>", idx_start) + len(b"</div></div>")

print(f"Replacing bytes {div_start} to {section_end}")

# Build correct template using Python b"..." (double-quoted bytes)
# Inside b"...": \\ = backslash, \" = double-quote, ' = apostrophe

new_section = (
    # Line 1: opening div
    b"'<div style=\"display:flex;gap:4px\">' +" + b"\r\r\n        " +
    # Line 2: Edit button
    b"'<button class=\"btn btn-primary\" onclick=\"showEditProduct(\\'' + p.id + '\\')\" style=\"font-size:11px;padding:6px 12px\">Edit</button>' +" + b"\r\r\n        " +
    # Line 3: Featured toggle (TERNARY EXPRESSION - no outer quotes!)
    b"(p.featured ? '<button onclick=\"toggleFeatured(\\'' + p.id + '\\',false)\" style=\"font-size:11px;padding:6px 10px;background:#e8f5e9;color:#2e7d32;border:1px solid #2e7d32;border-radius:4px;cursor:pointer\">\\u2b50 Featured</button>' : '<button onclick=\"toggleFeatured(\\'' + p.id + '\\',true)\" style=\"font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer\">\\u2b50 Feature</button>') +" + b"\r\r\n        " +
    # Line 4: Special Offer toggle (TERNARY EXPRESSION)
    b"(p.specialOffer ? '<button onclick=\"toggleSpecial(\\'' + p.id + '\\',false)\" style=\"font-size:11px;padding:6px 10px;background:#fff3e0;color:#e65100;border:1px solid #e65100;border-radius:4px;cursor:pointer\">\\ud83d\\udd25 On Sale</button>' : '<button onclick=\"toggleSpecial(\\'' + p.id + '\\',true)\" style=\"font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer\">\\ud83d\\udd25 Offer</button>') +" + b"\r\r\n        " +
    # Line 5: Delete button
    b"'<button class=\"btn\" onclick=\"deleteProduct(\\'' + p.id + '\\',\\'' + p.name.replace(/'/g,\"\\\\'\") + '\\')\" style=\"font-size:11px;padding:6px 12px;background:#ffebee;color:#c62828;border:none;border-radius:4px;cursor:pointer\">Del</button>' +" + b"\r\r\n      " +
    # Line 6: Closing div
    b"'</div></div>"
)

data = data[:div_start] + new_section + data[section_end:]

with open(path, "wb") as f:
    f.write(data)

# Verify
idx = data.find(b"showEditProduct")
section = data[idx:idx+500]
# Check there's no \' at end of lines
for bad in [b\"button>\\\\'\", b\"button>\\'\"]:
    if bad in data:
        print(f\"WARNING: Found {bad!r} in file!\")
        
# Verify the closing pattern
if b\"button>' +\" in data:
    print(\"OK: Found correct ' + pattern\")

if b\") +\" in data:
    print(\"OK: Found correct ) + pattern\")

print(\"\\nDone! Verifying JS parse...\")
