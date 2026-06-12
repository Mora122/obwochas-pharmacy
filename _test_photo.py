import urllib.request, json, time

# Test with real phone photo sizes (2-4MB original)
for label, size_mb in [("2MB photo", 2), ("3MB photo", 3), ("3.5MB photo", 3.5)]:
    # Simulate original JPEG size (base64 is ~1.37x larger)
    orig_mb = size_mb
    base64_str_len = int(orig_mb * 1024 * 1024 * 1.37)  # base64 overhead
    
    big = 'A' * base64_str_len
    payload = json.dumps({
        'name': 'Test',
        'phone': '+254712345678',
        'fileBase64': 'data:image/jpeg;base64,' + big
    }).encode()
    
    actual_mb = len(payload) / 1024 / 1024
    print(f'{label}: orig={orig_mb}MB json={actual_mb:.1f}MB', end=' ')
    
    ts = time.time()
    req = urllib.request.Request(
        'https://obwochas-pharmacy.vercel.app/api/prescription',
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        r = urllib.request.urlopen(req, timeout=60)
        print(f'-> OK ({time.time()-ts:.1f}s)')
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:100]
        print(f'-> HTTP {e.code}: {body}')

print()
print("=== BREAKDOWN ===")
print("4MB phone JPEG -> ~5.5MB base64 -> ~5.6MB JSON payload -> 413 FAILS")
print("3MB phone JPEG -> ~4.1MB base64 -> ~4.2MB JSON payload -> WORKS")
print("Solution: Compress image client-side before upload")
