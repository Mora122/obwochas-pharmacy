"""Remove duplicate cat+desc lines from product card template"""
with open("goodlife-replica/admin.html", "r", encoding="utf-8") as f:
    d = f.read()

target = "\r\n\r\n      '<div class=\"prod-cat\">' + (p.category || '') + ' • ' + p.id + '</div>' +\r\n\r\n        '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +\r\n\r\n"

if target in d:
    print("Found target!")
    d = d.replace(target, "\r\n")
    with open("goodlife-replica/admin.html", "w", encoding="utf-8") as f:
        f.write(d)
    print("Removed duplicate!")
else:
    print("Not found. Trying without second newline...")
    parts = ["\r\n\r\n      '<div class=\"prod-cat\">' + (p.category || '') + ' • ' + p.id + '</div>' +",
             "        '<div style=\"font-size:11px;color:#555;margin-top:2px\">' + (p.description ? p.description.substring(0,60) + (p.description.length > 60 ? '...' : '') : '') + '</div>' +",
             "\r\n\r\n"]
    target2 = parts[0] + "\r\n\r\n        " + parts[1].lstrip() + parts[2]
    if target2 in d:
        print("Found with single blank line!")
    else:
        print("Not found either. Checking exact bytes...")
        idx = d.find("(p.category || '')", 20800)
        if idx >= 0:
            print(f"Found at {idx}: ...{d[idx:idx+200]}")
        else:
            print("prod-cat not found in template area")
