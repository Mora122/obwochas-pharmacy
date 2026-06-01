"""Generate placeholder product images and update HTML files"""
import os
from PIL import Image, ImageDraw, ImageFont

output = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'
os.makedirs(output, exist_ok=True)

def make_placeholder(name, color, text, text2=""):
    """Create a nice 400x400 product placeholder image"""
    img = Image.new('RGB', (400, 400), color)
    draw = ImageDraw.Draw(img)
    
    # Try to use a nice font
    try:
        font_large = ImageFont.truetype("arial.ttf", 40)
        font_small = ImageFont.truetype("arial.ttf", 24)
    except:
        font_large = ImageFont.load_default()
        font_small = font_large
    
    # Center text
    bbox = draw.textbbox((0, 0), text, font=font_large)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((400-tw)/2, 140), text, fill='white' if sum(color) < 400 else 'black', font=font_large)
    
    if text2:
        bbox2 = draw.textbbox((0, 0), text2, font=font_small)
        tw2 = bbox2[2] - bbox2[0]
        draw.text(((400-tw2)/2, 210), text2, fill='white' if sum(color) < 400 else 'black', font=font_small)
    
    fname = os.path.join(output, f'{name}.jpg')
    img.save(fname, quality=85)
    print(f'Created {fname}')

# Placeholders for missing products with brand colors
placeholders = [
    ('pampers', (0, 153, 204), 'Pampers', 'Premium Care'),
    ('nivea_sun', (0, 51, 153), 'Nivea Sun', 'SPF 50+ 200ml'),
    ('piriton', (204, 0, 0), 'Piriton', 'Allergy Tablets 30s'),
    ('brufen', (0, 153, 102), 'Brufen', 'Ibuprofen 400mg'),
    ('sante_tea', (51, 102, 0), 'Sante', 'Herbal Tea 20 bags'),
    ('opti_whey', (102, 51, 0), 'Opti-Nutrition', 'Whey Protein 2kg'),
]

for name, color, text, text2 in placeholders:
    make_placeholder(name, color, text, text2)

print('\nAll placeholder images created!')
