"""Test API"""
import urllib.request
import json

resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/api/products?all=true")
data = json.loads(resp.read())
print(f"Products: {data['count']}")
if data['products']:
    p = data['products'][0]
    print(f"First: {p['name']} - stock: {p['stock']}")
