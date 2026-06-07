import os, re

html_dir = r'C:\Users\Administrator\.openclaw\workspace\obwochas-pharmacy'
files = [f for f in os.listdir(html_dir) if f.endswith('.html')]

# The Bootstrap + custom CSS js to inject in <head>
bootstrap_css = '\n<!-- Bootstrap 5 -->\n<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n'

# Bootstrap JS to inject before </body>
bootstrap_js = '\n<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>\n'

# Custom override CSS - inject after style.css
override_css = '''\n<!-- Bootstrap override: Obwocha brand -->\n<style>
:root{--bs-primary:#1a5c2e;--bs-primary-rgb:26,92,46;--bs-link-color:#1a5c2e;--bs-link-hover-color:#2d8a4a;--bs-btn-bg:#1a5c2e;--bs-btn-border-color:#1a5c2e;--bs-btn-hover-bg:#12401f;--bs-btn-hover-border-color:#12401f}
.navbar{background:#fff!important;border-bottom:1px solid #e0e0e0;padding:8px 0}
.navbar-brand{font-weight:800;color:#1a5c2e!important}
.navbar .nav-link{color:#333!important;font-weight:600;font-size:14px;padding:10px 16px!important}
.navbar .nav-link:hover,.navbar .nav-link.active{color:#1a5c2e!important;background:#f0f8f0;border-radius:6px}
.header-top-bar{background:#12401f;color:rgba(255,255,255,0.85);font-size:13px;padding:6px 20px}
.header-top-bar a{color:rgba(255,255,255,0.85);text-decoration:none;font-size:12px}
.header-top-bar a:hover{color:#ffd700}
.hero-section{background:linear-gradient(rgba(0,0,0,0.47),rgba(0,0,0,0.47)),#1a5c2e;min-height:360px;display:flex;align-items:center;color:#fff}
.hero-section h1{font-size:2.5rem;font-weight:800}
.hero-section p{font-size:1.1rem;opacity:0.92}
.btn-obwocha{background:#ffd700;color:#12401f;font-weight:700;padding:13px 32px;border:none;border-radius:4px;transition:0.2s ease}
.btn-obwocha:hover{background:#ffed4a;color:#12401f;transform:translateY(-2px)}
.btn-outline-obwocha{background:transparent;border:2px solid #fff;color:#fff;padding:11px 30px;font-weight:700;border-radius:4px}
.btn-outline-obwocha:hover{background:#fff;color:#1a5c2e}
.section-title{font-size:1.5rem;font-weight:800;color:#1a5c2e;margin-bottom:1.5rem}
.section-title span{color:#2d8a4a}
.card{border:1px solid #e0e0e0;border-radius:8px;transition:0.2s ease;height:100%}
.card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.08);transform:translateY(-2px)}
.footer{background:#12401f;color:rgba(255,255,255,0.85);padding:40px 0 20px}
.footer h5{color:#fff;font-weight:700;font-size:1rem;margin-bottom:1rem}
.footer a{color:rgba(255,255,255,0.7);text-decoration:none;font-size:14px}
.footer a:hover{color:#ffd700}
.whatsapp-float{background:#25D366;color:#fff;padding:8px 18px;border-radius:4px;font-weight:600;font-size:13px;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.whatsapp-float:hover{background:#1da851;color:#fff}
.cart-badge{position:absolute;top:-4px;right:-8px;background:#c00;color:#fff;border-radius:50%;width:18px;height:18px;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700}
.bg-accent{background:#ffd700;color:#12401f}
.text-accent{color:#ffd700}
</style>
'''

for fname in sorted(files):
    path = os.path.join(html_dir, fname)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    modified = False

    # 1. Inject Bootstrap CSS after existing CSS link(s) but before </head>
    # Find the last <link rel="stylesheet"> before </head>
    if '<link href="https://cdn.jsdelivr.net/npm/bootstrap' not in html:
        # Insert after style.css link, before </head>
        inserted = html.replace('</head>', bootstrap_css + '</head>')
        if inserted != html:
            html = inserted
            modified = True
            print(f'{fname}: Bootstrap CSS added')

    # 2. Inject custom override CSS after existing style.css
    if 'Bootstrap override: Obwocha brand' not in html:
        # Find existing <link rel="stylesheet"> 
        # Insert override right before </head> after bootstrap css
        inserted = html.replace('</head>', override_css + '\n</head>')
        if inserted != html:
            html = inserted
            modified = True
            print(f'{fname}: Override CSS added')

    # 3. Inject Bootstrap JS before </body>
    if '<script src="https://cdn.jsdelivr.net/npm/bootstrap' not in html:
        inserted = html.replace('</body>', bootstrap_js + '\n</body>')
        if inserted != html:
            html = inserted
            modified = True
            print(f'{fname}: Bootstrap JS added')

    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'  OK {fname} updated')
    
print('\nDone!')
