"""Fix second script (service worker + fix trailing HTML)"""
with open("goodlife-replica/admin.html", "rb") as f:
    d = f.read()

# Find the second script tag that has the service worker + stray HTML
ss = d.find(b"<script>", 20000)  # second script
if ss < 0:
    print("No second script found")
else:
    print(f"Second script at byte {ss}")
    se = d.find(b"</script>", ss+8)
    print(f"Ends at byte {se}")
    content = d[ss+8:se]
    print(f"Content: {repr(content[:100])}...{repr(content[-100:])}")
    
    # Check if it has stray HTML tags
    if b"<script" in content:
        print("Found stray HTML in script - removing")
        # Remove the stray <script src=...> tag from inside the script content
        idx = content.find(b"<script src")
        if idx >= 0:
            content = content[:idx].strip()
        d = d[:ss+8] + content + d[se:]
        with open("goodlife-replica/admin.html", "wb") as f:
            f.write(d)
        print("Fixed!")
    elif b"defer>" in content:
        # Remove the trailing tag  
        idx = content.find(b"defer>")
        if idx >= 0:
            content = content[:idx-1]  # remove the space before too
        d = d[:ss+8] + content + d[se:]
        with open("goodlife-replica/admin.html", "wb") as f:
            f.write(d)
        print("Removed stray tag!")
