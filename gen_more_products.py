"""Generate placeholder images for new pharmacy products"""
from PIL import Image, ImageDraw, ImageFont
import os

out = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\images'

# Name, color hex, text
new_products = [
    ('panadol_extra.jpg',   '#E53935', 'Panadol\nExtra'),
    ('cetirizine.jpg',      '#5E35B1', 'Cetirizine\n10mg'),
    ('vitamin_c.jpg',       '#F9A825', 'Vitamin C\n1000mg'),
    ('omega3.jpg',          '#1565C0', 'Omega-3\nFish Oil'),
    ('amoxicillin.jpg',     '#00897B', 'Amoxicillin\n500mg'),
    ('multivitamin.jpg',    '#6D4C41', 'Multi-\nVitamin'),
    ('hand_sanitizer.jpg',  '#00ACC1', 'Hand\nSanitizer'),
]

for filename, hex_color, text in new_products:
    img = Image.new('RGB', (400, 400), hex_color)
    draw = ImageDraw.Draw(img)
    
    # Border
    for i in range(5):
        draw.rectangle([i, i, 399-i, 399-i], outline='white', width=2)
    
    # Try to use a font, fall back to default
    try:
        font_lg = ImageFont.truetype('arial.ttf', 48)
        font_sm = ImageFont.truetype('arial.ttf', 20)
    except:
        font_lg = ImageFont.load_default()
        font_sm = ImageFont.load_default()
    
    # Brand label
    draw.text((200, 60), 'Obwocha\'s\nPharmacy', fill='white', font=font_sm, anchor='mm')
    
    # Product name
    draw.text((200, 200), text, fill='white', font=font_lg, anchor='mm')
    
    # Save
    fpath = os.path.join(out, filename)
    img.save(fpath, 'JPEG', quality=85)
    sz = os.path.getsize(fpath)
    print(f'{sz:>8,}  {filename}')

print('Done generating placeholders')
