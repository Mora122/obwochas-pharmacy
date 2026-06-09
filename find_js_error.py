"""Find JS syntax error using Node"""
import urllib.request
import subprocess
import tempfile
import os
import re

resp = urllib.request.urlopen('https://obwochas-pharmacy.vercel.app/admin.html')
html = resp.read()

script_start = html.find(b'<script>')
script_end = html.find(b'</script>', script_start+8)
js_raw = html[script_start+8:script_end]

# Remove \r chars to match what browser parses
js = js_raw.replace(b'\r', b'')

with tempfile.NamedTemporaryFile(suffix='.js', delete=False) as f:
    f.write(js)
    fname = f.name

try:
    result = subprocess.run(['node', '--check', fname], capture_output=True, text=True, timeout=5)
    if result.returncode != 0:
        print('STDERR:', result.stderr)
        match = re.search(r'position (\d+)', result.stderr)
        if match:
            pos = int(match.group(1))
            print(f'\nError near byte {pos}')
            ctx = js[max(0,pos-60):pos+60]
            print(f'Context: {repr(ctx)}')
            
            # Show line number
            lines_before = js[:pos].count(b'\n') + 1
            print(f'Line: {lines_before}')
    else:
        print('No syntax errors!')
finally:
    os.unlink(fname)
