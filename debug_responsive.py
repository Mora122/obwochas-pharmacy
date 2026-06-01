import urllib.request

# Fetch live shop page
resp = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/shop.html')
html = resp.read().decode('utf-8', errors='replace')

# Find header-nav structure  
h_end = html.find('</header>')
n_start = html.find('<nav', h_end)
print(f'Header ends at {h_end}, nav starts at {n_start}')
if h_end >= 0 and n_start >= 0:
    gap = html[h_end:n_start]
    print(f'Gap: {repr(gap)}')

# Check the toggle button
tb_idx = html.find('mobile-menu-toggle')
if tb_idx >= 0:
    print(f'Toggle button: {html[tb_idx:tb_idx+120]}')
else:
    print('No toggle button in live HTML!')

# Check CSS
resp2 = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/css/style.css')
css = resp2.read().decode('utf-8', errors='replace')
print(f'CSS file: {len(css)} bytes')
print(f'Has nav.main-nav: {"nav.main-nav" in css}')
print(f'Has @media queries: {css.count("@media")}')

# Check if mobile-menu-toggle has display: block at mobile sizes
print(f'Has .mobile-menu-toggle display block: {"display: block" in css and "mobile-menu-toggle" in css}')
