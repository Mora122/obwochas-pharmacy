import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract the script that populates featuredGrid
script_sections = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
for i, script in enumerate(script_sections):
    if 'featuredGrid' in script:
        print(f'\n=== SCRIPT {i} (has featuredGrid) ===')
        print(script)
