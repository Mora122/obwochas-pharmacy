with open('prescription.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Verify file input has required
if 'required style="display:none"' in content:
    print('OK: File input has required attribute')
else:
    print('WARN: File input missing required')

# Verify file validation
if 'Validate file upload' in content:
    print('OK: File validation code present')
else:
    print('WARN: File validation code missing')

if '!fileInput || fileInput.files.length === 0' in content:
    print('OK: File empty check present')
else:
    print('WARN: File empty check missing')

# Verify file input exclusion
if 'input:not([type=file])' in content:
    print('OK: File input excluded from generic collection')
else:
    print('WARN: File input not excluded')

# Verify old patterns removed
if "data['Prescription File'] = 'No file uploaded'" not in content:
    print('OK: No-file-uploaded fallback removed')
else:
    print('WARN: No-file-uploaded fallback still present')

if "var inputs = this.querySelectorAll('input, select, textarea')" not in content:
    print('OK: Old input selector removed')
else:
    print('WARN: Old input selector still present')

# Final character count
print(f'\nFile size: {len(content)} chars')
