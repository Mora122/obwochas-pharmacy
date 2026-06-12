import re

with open('prescription.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the submit handler section
old_submit = """  // Validate file upload
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

new_submit = """  // Validate file upload
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
  // Upload file and get view link
  var btn = this.querySelector('button[type=submit]');
  var origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Uploading...';
  var reader = new FileReader();
  var form = this;
  reader.onload = function(e) {
    var base64 = e.target.result;
    fetch('/api/upload-prescription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.querySelector('input[placeholder*=\"Full Name\"]').value,
        phone: document.querySelector('input[placeholder*=\"Phone\"]').value,
        email: document.querySelector('input[placeholder*=\"Email\"]').value,
        deliveryMethod: document.querySelector('select').value,
        nearestStore: document.querySelectorAll('select')[1].value,
        notes: document.querySelector('textarea').value,
        fileName: fileInput.files[0].name,
        fileSize: Math.round(fileInput.files[0].size/1024),
        fileBase64: base64
      })
    }).then(function(r) { return r.json(); }).then(function(result) {
      if (result.success) {
        sendWhatsApp(result.viewUrl);
      } else {
        alert('Upload failed: ' + (result.error || 'Unknown error'));
        btn.disabled = false;
        btn.textContent = origText;
      }
    }).catch(function(err) {
      alert('Upload error. Please try again.');
      btn.disabled = false;
      btn.textContent = origText;
    });
  };
  reader.readAsDataURL(fileInput.files[0]);
});

function sendWhatsApp(viewUrl) {
  var data = {};
  var inputs = document.querySelector('.contact-form').querySelectorAll('input:not([type=file]), select, textarea');
  inputs.forEach(function(inp) {
    var label = '';
    var prev = inp.previousElementSibling;
    if (prev && prev.tagName === 'LABEL') label = prev.textContent.replace(' *','').replace('\\u00a0','').trim();
    data[label || inp.placeholder || 'input'] = inp.value || '(empty)';
  });
  var fileInput = document.getElementById('prescFile');
  data['Prescription File'] = fileInput.files[0].name + ' (' + Math.round(fileInput.files[0].size/1024) + 'KB)';
  data['View Prescription'] = viewUrl;
  // WhatsApp message
  var msg = '*New Prescription Submission*\\n';
  for (var key in data) {
    msg += '\\n*' + key + ':* ' + data[key];
  }
  msg += '\\n\\n_Submitted via Obwocha Pharmacy website_';
  window.open('https://wa.me/+254727747699?text=' + encodeURIComponent(msg), '_blank');
  // Success screen
  document.querySelector('.contact-form').innerHTML = '<div style=\"text-align:center;padding:40px;\"><div style=\"font-size:48px;\">✅</div><h3>Prescription Submitted!</h3><p style=\"color:var(--text-light);\">A pharmacist will review and contact you within 1 hour.</p><a href=\"index.html\" class=\"btn btn-primary\" style=\"margin-top:16px;\">Back to Home</a></div>';
  if (typeof updateCartBadge === 'function') updateCartBadge();
}"""

if old_submit in content:
    content = content.replace(old_submit, new_submit)
    print('Submit handler updated successfully')
else:
    print('ERROR: Could not find old submit handler')
    idx = content.find('// Validate file upload')
    if idx > 0:
        print(f'Found at {idx}')
        print(repr(content[idx:idx+200]))
    idx2 = content.find('// WhatsApp message')
    if idx2 > 0:
        print(f'WhatsApp message at {idx2}')

with open('prescription.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
