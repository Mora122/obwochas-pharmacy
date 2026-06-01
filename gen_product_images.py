from PIL import Image, ImageDraw, ImageFont
import os, random

def generate_product_image(name, category, price, product_id, output_dir):
    w, h = 400, 400
    img = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(img)
    
    # Gradient background
    colors = {
        'Pain Relief': [(220, 50, 50), (180, 30, 30)],
        'Cold & Flu': [(100, 150, 200), (70, 120, 170)],
        'Vitamins & Supplements': [(46, 125, 50), (27, 94, 32)],
        'First Aid': [(200, 100, 50), (170, 80, 40)],
        'Baby Care': [(200, 150, 200), (170, 120, 170)],
        'Digestive Health': [(150, 120, 80), (130, 100, 60)],
        'Allergy & Skin Care': [(100, 180, 200), (70, 150, 170)],
        'Diabetes Care': [(80, 60, 140), (60, 40, 120)]
    }
    c1, c2 = colors.get(category, [(46, 125, 50), (27, 94, 32)])
    
    for y in range(h):
        r = int(c1[0] + (c2[0] - c1[0]) * y / h)
        g = int(c1[1] + (c2[1] - c1[1]) * y / h)
        b = int(c1[2] + (c2[2] - c1[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    
    # White circle in center
    draw.ellipse([80, 80, 320, 320], fill=(255, 255, 255, 200))
    draw.ellipse([80, 80, 320, 320], outline=(255, 255, 255), width=3)
    
    # Category icon
    icons = {
        'Pain Relief': '⚡',
        'Cold & Flu': '🤧',
        'Vitamins & Supplements': '💊',
        'First Aid': '🩹',
        'Baby Care': '🤱',
        'Digestive Health': '🫁',
        'Allergy & Skin Care': '🧴',
        'Diabetes Care': '🩸'
    }
    icon = icons.get(category, '💊')
    
    # Load font
    font_big = None
    font_med = None
    font_small = None
    for path in ['C:/Windows/Fonts/ARIALBD.TTF', 'C:/Windows/Fonts/ARIAL.TTF', 'C:/Windows/Fonts/SEGOEUI.TTF']:
        if os.path.exists(path):
            try:
                font_big = ImageFont.truetype(path, 40)
                font_med = ImageFont.truetype(path, 22)
                font_small = ImageFont.truetype(path, 16)
                break
            except:
                pass
    if not font_big:
        font_big = font_med = font_small = ImageFont.load_default()
    
    # Draw icon at top center of circle
    draw.text((175, 115), icon, fill=c1, font=font_big)
    
    # Draw product name (truncated if too long)
    display_name = name[:35] + '...' if len(name) > 35 else name
    # Center the text
    tw = draw.textlength(display_name, font=font_med) if hasattr(draw, 'textlength') else len(display_name) * 10
    draw.text(((400 - tw) // 2, 220), display_name, fill=(50, 50, 50), font=font_med)
    
    # Price
    price_str = f'KSh {price:,}'
    tw2 = draw.textlength(price_str, font=font_big) if hasattr(draw, 'textlength') else len(price_str) * 16
    draw.text(((400 - tw2) // 2, 265), price_str, fill=c1, font=font_big)
    
    # Bottom bar with pharmacy name
    draw.rectangle([0, 360, w, h], fill=(255, 255, 255, 200))
    draw.text((20, 370), 'Obwocha\'s Pharmacy', fill=(60, 60, 60), font=font_small)
    draw.text((320, 370), product_id, fill=(150, 150, 150), font=font_small)
    
    # Save
    filename = f'{product_id}.png'
    filepath = os.path.join(output_dir, filename)
    img.save(filepath, 'PNG')
    return filepath

# Generate all product images
output_dir = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images\products'
os.makedirs(output_dir, exist_ok=True)

products_data = [
    ('PROD-001', 'Panadol Extra 500mg', 'Pain Relief', 150),
    ('PROD-002', 'Brufen 400mg', 'Pain Relief', 180),
    ('PROD-003', 'Voltaren Emulgel 50g', 'Pain Relief', 650),
    ('PROD-004', 'Diclofenac Sodium 50mg', 'Pain Relief', 120),
    ('PROD-005', 'Piriton Tablets', 'Allergy & Skin Care', 80),
    ('PROD-006', 'Zyrtec 10mg', 'Allergy & Skin Care', 250),
    ('PROD-007', 'Benadryl Antihistamine', 'Allergy & Skin Care', 200),
    ('PROD-008', 'Cetaphil Gentle Skin Cleanser 500ml', 'Allergy & Skin Care', 1200),
    ('PROD-009', 'Lemsip Max Sachets (10 pack)', 'Cold & Flu', 550),
    ('PROD-010', 'Nasivin Nasal Spray', 'Cold & Flu', 380),
    ('PROD-011', 'Strepsils Honey & Lemon (24 pack)', 'Cold & Flu', 280),
    ('PROD-012', 'Vitamin C 1000mg', 'Vitamins & Supplements', 350),
    ('PROD-013', 'Multivitamin Daily', 'Vitamins & Supplements', 450),
    ('PROD-014', 'Vitamin D3 2000IU', 'Vitamins & Supplements', 400),
    ('PROD-015', 'Omega-3 Fish Oil 1000mg', 'Vitamins & Supplements', 550),
    ('PROD-016', 'Iron + Vitamin B12', 'Vitamins & Supplements', 320),
    ('PROD-017', 'Plasters Assorted (50 pack)', 'First Aid', 120),
    ('PROD-018', 'Bandages Crepe 4in - 4m', 'First Aid', 200),
    ('PROD-019', 'Dettol Antiseptic 500ml', 'First Aid', 380),
    ('PROD-020', 'Maalox Plus Suspension 250ml', 'Digestive Health', 420),
    ('PROD-021', 'Immodium Capsules (12 pack)', 'Digestive Health', 300),
    ('PROD-022', 'Piriton Baby Syrup 100ml', 'Baby Care', 250),
    ('PROD-023', 'Calpol Baby Drops 60ml', 'Baby Care', 350),
    ('PROD-024', 'Glucophage 500mg', 'Diabetes Care', 600),
]

for pid, name, cat, price in products_data:
    path = generate_product_image(name, cat, price, pid, output_dir)
    size = os.path.getsize(path)
    print(f'[OK] {pid}: {name} ({size:,} bytes)')

print(f'\nAll images saved to: {output_dir}')
print(f'Total: {len(products_data)} images')
