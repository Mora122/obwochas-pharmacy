"""Generate placeholder product images for Obwocha's Pharmacy"""
import os

PRODUCTS = [
    ("PROD-001", "Panadol Extra 500mg", "Pain Relief"),
    ("PROD-002", "Brufen 400mg", "Pain Relief"),
    ("PROD-003", "Voltaren Emulgel 50g", "Pain Relief"),
    ("PROD-004", "Diclofenac Sodium 50mg", "Pain Relief"),
    ("PROD-005", "Piriton Tablets", "Allergy & Skin Care"),
    ("PROD-006", "Zyrtec 10mg", "Allergy & Skin Care"),
    ("PROD-007", "Benadryl Antihistamine", "Allergy & Skin Care"),
    ("PROD-008", "Cetaphil Gentle Skin Cleanser 500ml", "Allergy & Skin Care"),
    ("PROD-009", "Lemsip Max Sachets", "Cold & Flu"),
    ("PROD-010", "Nasivin Nasal Spray", "Cold & Flu"),
    ("PROD-011", "Strepsils Honey & Lemon", "Cold & Flu"),
    ("PROD-012", "Vitamin C 1000mg", "Vitamins & Supplements"),
    ("PROD-013", "Multivitamin Daily", "Vitamins & Supplements"),
    ("PROD-014", "Vitamin D3 2000IU", "Vitamins & Supplements"),
    ("PROD-015", "Omega-3 Fish Oil 1000mg", "Vitamins & Supplements"),
    ("PROD-016", "Iron + Vitamin B12", "Vitamins & Supplements"),
    ("PROD-017", "Plasters Assorted 50pk", "First Aid"),
    ("PROD-018", "Bandages Crepe 4in", "First Aid"),
    ("PROD-019", "Dettol Antiseptic 500ml", "First Aid"),
    ("PROD-020", "Maalox Plus Suspension", "Digestive Health"),
    ("PROD-021", "Immodium Capsules", "Digestive Health"),
    ("PROD-022", "Piriton Baby Syrup", "Baby Care"),
    ("PROD-023", "Calpol Baby Drops", "Baby Care"),
    ("PROD-024", "Glucophage 500mg", "Diabetes Care"),
]

CAT_EMOJIS = {
    "Pain Relief": "💊",
    "Allergy & Skin Care": "🧴",
    "Cold & Flu": "🤧",
    "Vitamins & Supplements": "💪",
    "First Aid": "🩹",
    "Digestive Health": "🤢",
    "Baby Care": "👶",
    "Diabetes Care": "🩸",
}

CAT_COLORS = {
    "Pain Relief": "#e53935",
    "Allergy & Skin Care": "#7b1fa2",
    "Cold & Flu": "#1565c0",
    "Vitamins & Supplements": "#2e7d32",
    "First Aid": "#e65100",
    "Digestive Health": "#6d4c41",
    "Baby Care": "#00897b",
    "Diabetes Care": "#ad1457",
}

OUT_DIR = r"C:\Users\Administrator\.openclaw\workspace\obwochas-pharmacy\images\products"

def generate_svg(pid, name, category):
    emoji = CAT_EMOJIS.get(category, "💊")
    color = CAT_COLORS.get(category, "#2e7d32")
    short_name = name if len(name) <= 20 else name[:18] + ".."
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f5f8f5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e8f5e9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#bg)" rx="16"/>
  <text x="200" y="140" text-anchor="middle" font-size="80">{emoji}</text>
  <text x="200" y="220" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="{color}" font-weight="bold">{short_name}</text>
  <text x="200" y="250" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#666">{category}</text>
  <text x="200" y="280" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#999">{pid}</text>
  <rect x="80" y="310" width="240" height="40" rx="20" fill="{color}" opacity="0.15"/>
  <text x="200" y="336" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="{color}" font-weight="bold">Obwocha's Pharmacy</text>
</svg>'''
    return svg

for pid, name, cat in PRODUCTS:
    svg = generate_svg(pid, name, cat)
    path = os.path.join(OUT_DIR, f"{pid}.png")
    # We'll save as .svg naming but the API serves .png
    svg_path = os.path.join(OUT_DIR, f"{pid}.svg")
    # Also create .png that's actually SVG (for browsers that accept it)
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    # Also save as .png (the format the API uses)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated {pid} - {name}")

print(f"\nDone! Generated {len(PRODUCTS)} product images")
