import re

with open('prescription.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the file upload input - add 'required'
old1 = '<input type="file" id="prescFile" accept=".jpg,.jpeg,.png,.pdf" style="display:none">'
new1 = '<input type="file" id="prescFile" accept=".jpg,.jpeg,.png,.pdf" required style="display:none">'
content = content.replace(old1, new1)
print('Applied fix 1 - added required to file input')

# Replace the submit handler - add file validation
old2 = """  // File info
  var fileInput = document.getElementById('prescFile');
  if (fileInput && fileInput.files.length > 0) {
    data['Prescription File'] = fileInput.files[0].name + ' (' + Math.round(fileInput.files[0].size/1024) + 'KB)';
  } else {
    data['Prescription File'] = 'No file uploaded';
  }
  // WhatsApp message"""

new2 = """  // Validate file upload
  var fileInput = document.getElementById('prescFile');
  if (!fileInput || fileInput.files.length === 0) {
    var zone = document.querySelector('.upload-zone');
    if (zone) {
      zone.style.borderColor = '#e53935';
      zone.style.borderStyle = 'solid';
      if (!zone.querySelector('.error-msg')) {
        var err = document.createElement('p');
        err.className = 'error-msg';
        err.style.cssText = 'color:#e53935;font-size:13px;margin-top:8px;';
        err.textContent = 'Please upload your prescription before submitting';
        zone.parentNode.appendChild(err);
      }
    }
    return;
  }
  // File info
  data['Prescription File'] = fileInput.files[0].name + ' (' + Math.round(fileInput.files[0].size/1024) + 'KB)';
  // WhatsApp message"""

if old2 in content:
    content = content.replace(old2, new2)
    print('Applied fix 2 - added file validation before submit')
else:
    print('ERROR: Could not find old2 pattern')
    # Debug: find similar text
    idx = content.find('// File info')
    if idx > 0:
        print(f'Found "// File info" at {idx}')
        print(repr(content[idx:idx+500]))

# Also exclude file input from the initial collection
old3 = "  var inputs = this.querySelectorAll('input, select, textarea');"
new3 = "  var inputs = this.querySelectorAll('input:not([type=file]), select, textarea');"
if old3 in content:
    content = content.replace(old3, new3)
    print('Applied fix 3 - exclude file input from generic collection')
else:
    print('ERROR: Could not find old3 pattern')

with open('prescription.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('\nAll fixes applied')
