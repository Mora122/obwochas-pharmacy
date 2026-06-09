"""Rewrite the product card template section with correct JS string termination.
The original uses pattern: '<string>' + p.id + '<string>' + 
Each line ends with ' + (no backslash before closing quote).
"""
import os

path = os.path.join("goodlife-replica", "admin.html")
with open(path, "rb") as f:
    data = f.read()

# Find the section to replace
idx_start = data.find(b"showEditProduct")
section_start = data.rfind(b'display:flex;gap:4px">', 0, idx_start)
# Find the actual start of the div
div_start = data.rfind(b"<div", 0, section_start)
section_end = data.find(b"</div></div>", idx_start) + len(b"</div></div>")

print(f"Section: bytes {div_start} to {section_end}")

# Build the replacement using DOUBLE-QUOTED Python strings to avoid escaping hell
# Use the EXACT pattern from the git diff but fix the string termination

# In the file, template strings use ' as JS delimiter
# Inside strings, \" escapes a double-quote for the HTML attribute
# Inside strings, \' escapes a single-quote - this is the JS escaped quote
# At string boundaries, ' ends the string, ' starts a new one

# The ORIGINAL working pattern for showEditProduct:
# onclick="showEditProduct(\'' + p.id + '\')"
# JS sees: onclick="showEditProduct('  + variable +  ')"

# NEW template with featured/special toggles:
new_section = (
    # Opening div + Edit button (same structure as original)
    b'<div style="display:flex;gap:4px">\\\' +' + b"\r\r\n        " +
    b"'<button class=\"btn btn-primary\" onclick=\"showEditProduct(\\'' + p.id + '\\')\" style=\"font-size:11px;padding:6px 12px\">Edit</button>' +" + b"\r\r\n        " +
    # Featured toggle (ternary expression, NOT string concatenation)
    b"(p.featured ? '<button onclick=\"toggleFeatured(\\'' + p.id + '\\',false)\" style=\"font-size:11px;padding:6px 10px;background:#e8f5e9;color:#2e7d32;border:1px solid #2e7d32;border-radius:4px;cursor:pointer\">\\u2b50 Featured</button>' : '<button onclick=\"toggleFeatured(\\'' + p.id + '\\',true)\" style=\"font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer\">\\u2b50 Feature</button>') +" + b"\r\r\n        " +
    # Special Offer toggle (ternary expression)
    b"(p.specialOffer ? '<button onclick=\"toggleSpecial(\\'' + p.id + '\\',false)\" style=\"font-size:11px;padding:6px 10px;background:#fff3e0;color:#e65100;border:1px solid #e65100;border-radius:4px;cursor:pointer\">\\ud83d\\udd25 On Sale</button>' : '<button onclick=\"toggleSpecial(\\'' + p.id + '\\',true)\" style=\"font-size:11px;padding:6px 10px;background:#f5f5f5;color:#888;border:1px solid #ddd;border-radius:4px;cursor:pointer\">\\ud83d\\udd25 Offer</button>') +" + b"\r\r\n        " +
    # Delete button (same as original)
    b"'<button class=\"btn\" onclick=\"deleteProduct(\\'' + p.id + '\\',\\'' + p.name.replace(/'/g,\"\\\\'\") + '\\')\" style=\"font-size:11px;padding:6px 12px;background:#ffebee;color:#c62828;border:none;border-radius:4px;cursor:pointer\">Del</button>' +" + b"\r\r\n      " +
    # Closing div (same as original)
    b"\\'</div></div>"
)

data = data[:div_start] + new_section + data[section_end:]

with open(path, "wb") as f:
    f.write(data)

# Verify by checking string termination patterns
idx = data.find(b'Edit</button>')
# Find the first ' after Edit</button> - should be just ' + (no backslash)
print("Edit button line ending context:")
print(repr(data[idx:idx+20]))

# Check for the broken \' + pattern
if b"Edit</button>\\'" in data:
    print("WARNING: Found broken \\' pattern!")
else:
    print("OK: No broken \\' pattern detected")

print("\nDone! File updated.")
