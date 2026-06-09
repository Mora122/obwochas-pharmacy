"""Check which product SVG files exist on Vercel"""
import urllib.request
urls = [
    "https://obwochas-pharmacy.vercel.app/images/products/PROD-001.svg",
    "https://obwochas-pharmacy.vercel.app/images/products/PROD-021.svg",
    "https://obwochas-pharmacy.vercel.app/images/products/PROD-018.svg",
    "https://obwochas-pharmacy.vercel.app/images/placeholder.svg",
]
for u in urls:
    try:
        r = urllib.request.urlopen(u)
        print(f"{u.split('/')[-1]}: {r.status} ({len(r.read())} bytes)")
    except Exception as e:
        print(f"{u.split('/')[-1]}: FAILED - {e}")
