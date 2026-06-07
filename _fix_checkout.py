import re
with open('checkout.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace top bar
html = re.sub(
    r'<div class="top-bar">.*?</div>',
    '<div class="header-top-bar d-flex justify-content-between align-items-center flex-wrap px-3"><span>Free Delivery For orders above KSh 2,500/=</span><div><a href="help.html" class="ms-2">Help</a><a href="contact.html" class="ms-2">Contact</a></div></div>',
    html, count=1, flags=re.DOTALL
)

# Replace footer
html = re.sub(
    r'<footer>.*?</footer>',
    '<footer class="footer"><div class="container text-center py-3"><p class="small opacity-75 mb-1">&copy; 2026 Obwocha\'s Pharmacy. All Rights Reserved.</p><div class="small opacity-75">M-Pesa | Visa | MasterCard | Cash-on-Delivery</div></div></footer>',
    html, count=1, flags=re.DOTALL
)

with open('checkout.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('checkout.html updated')
