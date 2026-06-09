# Debug: trace how line() generates the quickStock output
s = "'<button onclick=\"quickStock(' + \"'\" + p.id + \"'\" + ',-1)\" title=\"Remove 1\" style=\"padding:2px 6px;font-size:11px;background:#ffebee;color:#c62828;border:1px solid #ef9a9a;border-radius:3px;cursor:pointer\">-1</button>' +"
print("Python repr:", repr(s))
print("Actual text:", s)
print("Bytes:", s.encode("utf-8"))
