import urllib.request, json, time, sys

# Test various payload sizes to find Vercel limits
for label, size_mb in [("500KB", 0.5), ("1MB", 1), ("2MB", 2), ("3MB", 3), ("4MB", 4)]:
    data_size = int(size_mb * 1024 * 1024)
    big = 'A' * data_size
    payload = json.dumps({
        'name': 'Test ' + label,
        'phone': '+254712345678',
        'fileBase64': 'data:image/jpeg;base64,' + big
    }).encode()
    
    actual_mb = len(payload) / 1024 / 1024
    print(f'{label}: {actual_mb:.2f}MB', end=' -> ')
    sys.stdout.flush()
    
    ts = time.time()
    req = urllib.request.Request(
        'https://obwochas-pharmacy.vercel.app/api/prescription',
        data=payload,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        r = urllib.request.urlopen(req, timeout=60)
        j = json.loads(r.read())
        if j.get('success'):
            print(f'OK ({time.time()-ts:.1f}s)')
        else:
            print(f'FAIL: {j.get("error","?")}')
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:200]
        print(f'HTTP {e.code}: {body}')
    except Exception as e:
        print(f'ERROR: {type(e).__name__}: {e}')
