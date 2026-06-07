# -*- coding: utf-8 -*-
import os

d = r"C:\Users\Administrator\.openclaw\workspace\obwochas-pharmacy\images\products"
prods = [
    ("PROD-001", "Panadol Extra", "Pain Relief"),
    ("PROD-002", "Brufen 400mg", "Pain Relief"),
    ("PROD-003", "Voltaren Emulgel", "Pain Relief"),
    ("PROD-004", "Diclofenac Sodium", "Pain Relief"),
    ("PROD-005", "Piriton Tablets", "Allergy & Skin Care"),
    ("PROD-006", "Zyrtec 10mg", "Allergy & Skin Care"),
    ("PROD-007", "Benadryl", "Allergy & Skin Care"),
    ("PROD-008", "Cetaphil Cleanser", "Allergy & Skin Care"),
    ("PROD-009", "Lemsip Max", "Cold & Flu"),
    ("PROD-010", "Nasivin Spray", "Cold & Flu"),
    ("PROD-011", "Strepsils", "Cold & Flu"),
    ("PROD-012", "Vitamin C 1000mg", "Vitamins & Supplements"),
    ("PROD-013", "Multivitamin Daily", "Vitamins & Supplements"),
    ("PROD-014", "Vitamin D3", "Vitamins & Supplements"),
    ("PROD-015", "Omega-3 Fish Oil", "Vitamins & Supplements"),
    ("PROD-016", "Iron + B12", "Vitamins & Supplements"),
    ("PROD-017", "Plasters 50pk", "First Aid"),
    ("PROD-018", "Bandages Crepe", "First Aid"),
    ("PROD-019", "Dettol 500ml", "First Aid"),
    ("PROD-020", "Maalox Plus", "Digestive Health"),
    ("PROD-021", "Immodium", "Digestive Health"),
    ("PROD-022", "Piriton Baby Syrup", "Baby Care"),
    ("PROD-023", "Calpol Baby Drops", "Baby Care"),
    ("PROD-024", "Glucophage 500mg", "Diabetes Care"),
]

colors = {
    "Pain Relief": "#e53935",
    "Allergy & Skin Care": "#7b1fa2",
    "Cold & Flu": "#1565c0",
    "Vitamins & Supplements": "#2e7d32",
    "First Aid": "#e65100",
    "Digestive Health": "#6d4c41",
    "Baby Care": "#00897b",
    "Diabetes Care": "#ad1457",
}

for pid, name, cat in prods:
    color = colors.get(cat, "#2e7d32")
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">'
        '<defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">'
        '<stop offset="0%" style="stop-color:#f5f8f5"/>'
        '<stop offset="100%" style="stop-color:#e8f5e9"/>'
        '</linearGradient></defs>'
        '<rect width="400" height="400" fill="url(#g)" rx="16"/>'
        f'<text x="200" y="165" text-anchor="middle" font-family="sans-serif" font-size="28" fill="{color}" font-weight="bold">{name}</text>'
        f'<text x="200" y="200" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#888">{cat}</text>'
        f'<rect x="100" y="300" width="200" height="36" rx="18" fill="none" stroke="{color}" stroke-width="2" opacity="0.5"/>'
        f'<text x="200" y="324" text-anchor="middle" font-family="sans-serif" font-size="12" fill="{color}">Obwocha Pharmacy</text>'
        f'<text x="200" y="380" text-anchor="middle" font-family="sans-serif" font-size="10" fill="#ccc">{pid}</text>'
        '</svg>'
    )
    with open(os.path.join(d, pid + ".svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    print(f"{pid} - {name}")

print(f"Done! Generated {len(prods)} product images (no shadows)")
