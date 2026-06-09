"""Verify account.html integrity"""
with open("goodlife-replica/account.html", "rb") as f:
    d = f.read()

checks = [
    (b"DOCTYPE", "DOCTYPE"),
    (b"</head>", "</head>"),
    (b"</body>", "</body>"),
    (b"</html>", "</html>"),
    (b"KSh 5,000", "Delivery threshold"),
    (b"dashContent", "Dashboard content"),
    (b"handleLogin", "handleLogin function"),
    (b"handleRegister", "handleRegister function"),
    (b"loadDashboard", "loadDashboard function"),
    (b"logoutUser", "logoutUser function"),
    (b"showError", "showError function"),
    (b"serviceWorker", "Service Worker"),
    (b'<script', "script tags"),
]

for pattern, name in checks:
    count = d.count(pattern)
    status = "OK" if count > 0 else "MISSING"
    if pattern == b'<script':
        print(f"  {name}: {count} ({status})")
    else:
        print(f"  {name}: {status}")

print(f"\nFile size: {len(d)} bytes")
print(f"Starts with: {d[:30]}")
print(f"Ends with: {d[-30:]}")
