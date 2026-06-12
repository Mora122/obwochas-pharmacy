import sys, re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find where featuredGrid is populated - look for script tags
script_sections = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
for i, script in enumerate(script_sections):
    if 'featuredGrid' in script or 'addToCart' in script or 'PROD-' in script:
        print(f'\n=== SCRIPT {i} (has featuredGrid/addToCart/PROD) ===')
        # Find addToCart calls
        atc_calls = re.findall(r"addToCart\('[^']+'\)", script)
        for call in atc_calls:
            print(f'  {call}')
        
        # Check for PROD- pattern
        prod_ids = re.findall(r'PROD-\d+', script)
        for pid in prod_ids:
            print(f'  Product ID: {pid}')
        
        # Show full script (first 500 chars)
        print(f'\n  Script snippet: {script[:300]}...')

# Also check other JS files
import os
for root, dirs, files in os.walk('js'):
    for fname in files:
        with open(os.path.join(root, fname), 'r', encoding='utf-8') as f:
            content = f.read()
            if 'featuredGrid' in content or 'addToCart' in content:
                atc_calls = re.findall(r"addToCart\('[^']+'\)", content)
                if atc_calls:
                    print(f'\n=== {fname} addToCart calls ===')
                    for call in atc_calls:
                        print(f'  {call}')
