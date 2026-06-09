"""Debug the '' issue"""
import urllib.request

resp = urllib.request.urlopen("https://obwochas-pharmacy.vercel.app/admin.html")
html = resp.read()
script_start = html.find(b"<script>")
script_end = html.find(b"</script>", script_start+8)
js = html[script_start+8:script_end]

# Find the exact area around the double-quote issue
target = b"''<div"
idx = js.find(target)
print("Double-'' context:")
print(repr(js[idx-80:idx+80]))

# Show what comes right before
print("\nLeft context (end of previous line):")
prev_newline = js.rfind(b"\n", 0, idx)
print(repr(js[prev_newline:prev_newline+30]))

# Show what the line with the error looks like
next_newline = js.find(b"\n", idx)
print("\nLine with error:")
print(repr(js[prev_newline+1:next_newline]))
