import os, re

html_dir = r'C:\Users\Administrator\.openclaw\workspace\obwochas-pharmacy'
exclude = {'index.html', 'admin.html'}  # index done, admin has special layout

# Bootstrap navbar HTML (minified, reusable)
NAVBAR = '''<nav class="navbar navbar-expand-lg sticky-top">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
      <img src="icons/logo.svg" alt="Obwocha's Pharmacy" width="44" height="44">
      <div>
        <div style="font-size:1.25rem;font-weight:800;color:#1a5c2e;line-height:1.1">Obwocha's <span style="color:#2d8a4a">Pharmacy</span></div>
        <small class="text-muted" style="font-size:10px;display:block;line-height:1">Meru's Own Pharmacy</small>
      </div>
    </a>
    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="shop.html">Shop By Category</a></li>
        <li class="nav-item"><a class="nav-link" href="health-conditions.html">Shop By Condition</a></li>
        <li class="nav-item"><a class="nav-link" href="brands.html">Shop By Brand</a></li>
        <li class="nav-item"><a class="nav-link" href="shop.html?sale=1">Sale & Offers</a></li>
        <li class="nav-item"><a class="nav-link" href="prescription.html">Submit Prescription</a></li>
        <li class="nav-item"><a class="nav-link" href="ederma.html">Skin Test</a></li>
        <li class="nav-item"><a class="nav-link" href="services.html">Health Services</a></li>
        <li class="nav-item"><a class="nav-link" href="store-locator.html">Store Locator</a></li>
      </ul>
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <form class="d-flex" role="search" action="shop.html" method="GET">
          <input class="form-control form-control-sm me-1" type="search" name="q" placeholder="Search..." aria-label="Search" style="border:2px solid #1a5c2e;border-radius:4px;">
          <button class="btn btn-sm" style="background:#1a5c2e;color:#fff;border-radius:4px;font-weight:600;" type="submit">Search</button>
        </form>
        <a href="https://wa.me/+254727747699" target="_blank" class="whatsapp-float text-decoration-none">📱 0727747699</a>
        <a href="account.html" class="text-decoration-none" style="color:#333;font-size:14px;font-weight:600;">👤 Account</a>
        <a href="cart.html" class="position-relative text-decoration-none" style="color:#333;font-size:20px;">🛒<span class="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cartCount">0</span></a>
      </div>
    </div>
  </div>
</nav>'''

FOOTER = '''<footer class="footer">
  <div class="container">
    <div class="row g-4">
      <div class="col-6 col-md-3">
        <h5>Shop By Category</h5>
        <div class="d-flex flex-column gap-1">
          <a href="shop.html?cat=vitamins">Vitamin &amp; Supplements</a>
          <a href="shop.html?cat=skincare">Skin Care</a>
          <a href="brands.html">All Brands</a>
          <a href="prescription.html">Prescription Services</a>
          <a href="services.html">The Health Hub</a>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <h5>About Us</h5>
        <div class="d-flex flex-column gap-1">
          <a href="about.html">About Obwocha</a>
          <a href="health-conditions.html">Health Conditions</a>
          <a href="blog.html">Blog</a>
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms &amp; Conditions</a>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <h5>Customer Care</h5>
        <div class="d-flex flex-column gap-1">
          <a href="returns.html">Delivery &amp; Returns</a>
          <a href="account.html">My Account</a>
          <a href="faq.html">FAQ's</a>
          <a href="sitemap.html">Sitemap</a>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <h5>Contact Us</h5>
        <div class="d-flex flex-column gap-1 small">
          <p class="mb-1">📞 <a href="tel:0727747699">0727747699</a></p>
          <p class="mb-1">📱 <a href="https://wa.me/+254727747699">0727747699</a></p>
          <p class="mb-1">📧 <a href="mailto:info@obwochaspharmacy.co.ke">Email</a></p>
          <p class="mb-1 small opacity-75">P.O. Box 1852-00621<br>Nairobi, Kenya</p>
        </div>
      </div>
    </div>
    <hr class="my-3" style="border-color:rgba(255,255,255,0.15);">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
      <div>
        <a href="terms.html" class="small">Terms &amp; Conditions</a>
        <span class="mx-1 opacity-50">|</span>
        <a href="privacy.html" class="small">Privacy Policy</a>
        <span class="mx-1 opacity-50">|</span>
        <a href="cookies.html" class="small">Cookie Policy</a>
      </div>
      <div class="small opacity-75">Copyright &copy; 2026 <a href="index.html" style="color:#ffd700;">Obwocha's Pharmacy</a>. All Rights Reserved.</div>
      <div class="small opacity-75">M-Pesa | Visa | MasterCard | Cash-on-Delivery</div>
    </div>
  </div>
</footer>'''

for fname in sorted(os.listdir(html_dir)):
    if not fname.endswith('.html') or fname in exclude:
        continue
    path = os.path.join(html_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Skip if already converted (has Bootstrap navbar)
    if 'Bootstrap override: Obwocha brand' not in html:
        print(f'Skipping {fname}: no Bootstrap override CSS found')
        continue
    
    # Only convert pages that still have old header structure
    has_old_header = 'class="top-bar"' in html and 'class="header-nav-wrap"' in html
    has_old_footer = '<footer>' in html and 'class="footer-grid"' in html

    if not has_old_header and not has_old_footer:
        print(f'Skipping {fname}: already converted or no old structure')
        continue

    # Replace old top bar
    html = re.sub(
        r'<div class="top-bar">.*?</div>\s*',
        '<div class="header-top-bar d-flex justify-content-between align-items-center flex-wrap px-3">\n  <span>Free Delivery For orders above KSh 2,500/=</span>\n  <div>\n    <a href="membership.html" class="ms-2">Health Club</a>\n    <a href="wellness.html" class="ms-2">Wellness</a>\n    <a href="about.html" class="ms-2">About</a>\n    <a href="blog.html" class="ms-2">Blog</a>\n    <a href="faq.html" class="ms-2">FAQ</a>\n    <a href="contact.html" class="ms-2">Contact</a>\n  </div>\n</div>\n',
        html, count=1, flags=re.DOTALL
    )

    # Replace old header/nav block
    html = re.sub(
        r'<div class="header-nav-wrap">.*?</div>\s*',
        NAVBAR + '\n',
        html, count=1, flags=re.DOTALL
    )

    # Replace old footer
    html = re.sub(
        r'<footer>.*?</footer>',
        FOOTER,
        html, count=1, flags=re.DOTALL
    )

    # Replace old whatsapp float  
    html = re.sub(
        r'<a href="https://wa.me/\+254727747699".*?class="whatsapp-float">.*?</a>',
        '<a href="https://wa.me/+254727747699" target="_blank" class="whatsapp-float position-fixed bottom-0 end-0 m-3 text-decoration-none shadow" style="z-index:999;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;font-size:28px;" title="Chat on WhatsApp">\U0001f4ac</a>',
        html
    )

    # Replace old newsletter section
    html = re.sub(
        r'<section class="newsletter">.*?</section>',
        '<section class="py-5 text-center" style="background:#12401f;color:#fff;">\n  <div class="container" style="max-width:600px;">\n    <h3 class="fw-bold mb-2">Stay in the Know</h3>\n    <p class="small mb-3 opacity-75">Sign up for the latest deals, product news, health tips, and exclusive offers from Obwocha\'s Pharmacy.</p>\n    <form class="d-flex gap-2 justify-content-center">\n      <input type="email" class="form-control" placeholder="Enter your email address" style="max-width:350px;border-radius:4px;">\n      <button class="btn btn-warning fw-bold text-dark" type="submit" style="background:#ffd700;border:none;">Subscribe</button>\n    </form>\n  </div>\n</section>',
        html, count=1, flags=re.DOTALL
    )

    # Replace old promo-banner
    html = re.sub(
        r'<div class="promo-banner">.*?</div>',
        '<div class="promo-banner" style="background:linear-gradient(135deg,#1a5c2e,#2d8a4a);color:#fff;text-align:center;padding:10px 20px;font-size:14px;font-weight:600;">\n  Summer Sale &mdash; Up to <span style="color:#ffd700;font-weight:700;">40% OFF</span> on Sun Care &amp; Beauty Products.\n  <a href="shop.html?sale=1" style="color:#fff;text-decoration:underline;font-weight:600">Shop Now \u2192</a>\n</div>',
        html, count=1, flags=re.DOTALL
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'OK {fname} updated')

print('\nDone!')
