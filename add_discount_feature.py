"""Add giveDiscount function to admin.html"""
with open("goodlife-replica/admin.html", "rb") as f:
    data = f.read()

# The section to replace: end of updateOrderStatus to before PRODUCTS
old = b"""}

/* ========= PRODUCTS ========= */"""

new = b"""}

async function giveDiscount(orderId) {
  var type = prompt('Discount type? Enter \"%\" for percentage or \"KSh\" for fixed amount:', '%');
  if (type === null) return;
  var isPercent = type.trim() === '%';
  var val = prompt('Discount value' + (isPercent ? ' (e.g., 10 for 10% off):' : ' (e.g., 500 for KSh 500 off):'));
  if (val === null) return;
  var numVal = parseFloat(val);
  if (isNaN(numVal) || numVal <= 0) { alert('Invalid value'); return; }
  var reason = prompt('Reason for discount (optional):', '');
  if (reason === null) return;
  try {
    var r = await fetch(API + '/order?id=' + orderId, {
      method: 'PATCH',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        discount: {
          type: isPercent ? 'percentage' : 'fixed',
          value: numVal,
          reason: reason.trim() || 'Admin discount'
        }
      })
    });
    var d = await r.json();
    if (d.success) {
      loadOrders();
      showOrderDetail(orderId);
    } else {
      alert('Error: ' + d.error);
    }
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

/* ========= PRODUCTS ========= */"""

# Convert to bytes with CRLF (note: old/new already have raw \r\n in file content)
import re
# Normalize: strip any existing line endings, then add CRLF
old_b = re.sub(r'\r?\n', '\r\n', old).encode('utf-8')
new_b = re.sub(r'\r?\n', '\r\n', new).encode('utf-8')

if old_b in data:
    data = data.replace(old_b, new_b)
    with open("goodlife-replica/admin.html", "wb") as f:
        f.write(data)
    print("Added giveDiscount function!")
else:
    print("Pattern not found!")
    # Find what's actually between updateOrderStatus and PRODUCTS
    idx = data.find(b"async function updateOrderStatus(id)")
    end = data.find(b"/* ========= PRODUCTS ========= */", idx)
    between = data[idx:end]
    # Show last 200 bytes
    print(repr(between[-200:]))
