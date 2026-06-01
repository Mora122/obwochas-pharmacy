"""Upload the investor pitch video to a file sharing service"""
import urllib.request, json, os, io

video_path = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_investor_pitch.mp4'
sz = os.path.getsize(video_path)
print("File: %.1f MB" % (sz/1024/1024))

# Method 1: file.io
try:
    import requests
    with open(video_path, 'rb') as f:
        resp = requests.post(
            'https://file.io',
            files={'file': ('obwocha_investor_pitch.mp4', f, 'video/mp4')},
            data={'expires': '14d'},
            timeout=30
        )
    result = resp.json()
    if result.get('success'):
        print("file.io link:", result['link'])
    else:
        print("file.io failed:", result)
except Exception as e:
    print("file.io:", e)

# Method 2: 0x0.st (nullpointer)
try:
    with open(video_path, 'rb') as f:
        resp = requests.post(
            'https://0x0.st',
            files={'file': ('obwocha_investor_pitch.mp4', f, 'video/mp4')},
            timeout=60
        )
    if resp.status_code == 200:
        print("0x0.st link:", resp.text.strip())
except Exception as e:
    print("0x0.st:", e)

# Method 3: tmpfiles.org
try:
    with open(video_path, 'rb') as f:
        resp = requests.post(
            'https://tmpfiles.org/api/v1/upload',
            files={'file': ('obwocha_investor_pitch.mp4', f, 'video/mp4')},
            timeout=60
        )
    result = resp.json()
    if result.get('status') == 'success':
        print("tmpfiles.org link:", result['data']['url'])
    else:
        print("tmpfiles.org failed:", result)
except Exception as e:
    print("tmpfiles.org:", e)
