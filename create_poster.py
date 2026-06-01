from PIL import Image, ImageDraw, ImageFont
import os

# Create a professional pharmacy poster at poster size
w, h = 1200, 1800  # 2:3 ratio
img = Image.new('RGB', (w, h), (255, 255, 255))
draw = ImageDraw.Draw(img)

# Green gradient header area
for y in range(0, 500):
    r = int(46 - (y / 500) * 20)
    g = int(125 - (y / 500) * 30)
    b = int(50 - (y / 500) * 15)
    draw.line([(0, y), (w, y)], fill=(max(0, r), max(0, g), max(0, b)))

# Bottom green band
for y in range(1500, 1800):
    r = int(46 - ((y-1500)/300) * 15)
    g = int(125 - ((y-1500)/300) * 20)
    b = int(50 - ((y-1500)/300) * 10)
    draw.line([(0, y), (w, y)], fill=(max(0, r), max(0, g), max(0, b)))

# Pharmacy cross / plus icon (white with green outline)
cross_size = 120
cx, cy = w // 2, 140
# Vertical bar
draw.rectangle([cx-30, cy-120, cx+30, cy+120], fill=(255, 255, 255))
# Horizontal bar
draw.rectangle([cx-120, cy-30, cx+120, cy+30], fill=(255, 255, 255))
# Green outline for cross
draw.rectangle([cx-30, cy-120, cx+30, cy+120], outline=(0, 100, 40), width=4)
draw.rectangle([cx-120, cy-30, cx+120, cy+30], outline=(0, 100, 40), width=4)

# Try to load fonts
font_title = None
font_sub = None
font_body = None
font_small = None
font_big = None

font_candidates = [
    ('C:/Windows/Fonts/ARIALBD.TTF', 'arialbd'),
    ('C:/Windows/Fonts/ARIAL.TTF', 'arial'),
    ('C:/Windows/Fonts/SEGOEUI.TTF', 'segoeui'),
    ('C:/Windows/Fonts/BAHNSCHT.TTF', 'bahnschrift'),
]

for path, name in font_candidates:
    if os.path.exists(path):
        try:
            font_big = ImageFont.truetype(path, 110)
            font_title = ImageFont.truetype(path, 90)
            font_sub = ImageFont.truetype(path, 42)
            font_body = ImageFont.truetype(path, 34)
            font_small = ImageFont.truetype(path, 26)
            print(f"Using font: {path}")
            break
        except:
            pass

if not font_title:
    font_title = ImageFont.load_default()
    font_sub = font_title
    font_body = font_title
    font_small = font_title
    font_big = font_title

# Title text
title_line1 = "Obwocha's"
title_line2 = "Pharmacy"

# Draw title with shadow
for dy, clr in [(3, (0, 100, 40)), (0, (255, 255, 255))]:
    draw.text((w//2 - 220 + dy, 320 + dy), title_line1, fill=clr, font=font_big)
    draw.text((w//2 - 250 + dy, 420 + dy), title_line2, fill=clr, font=font_big)

# Subtitle
draw.text((w//2 - 250, 540), "Your Trusted Community Pharmacy", fill=(0, 130, 60), font=font_sub)

# Green divider line
draw.rectangle([200, 610, w-200, 614], fill=(0, 160, 60))

# Decorative icons row
icons = [
    ('\u2695', 'Quality\nHealthcare'),
    ('\U0001F69A', 'Free\nDelivery'),
    ('\U0001F48A', 'Affordable\nMedicines'),
    ('\U0001F4DE', 'Same-Day\nService'),
]

icon_y = 670
icon_spacing = w // 5
for i, (icon, label) in enumerate(icons):
    cx2 = icon_spacing * (i + 1) - icon_spacing // 2
    # Circle background
    draw.ellipse([cx2-50, icon_y-50, cx2+50, icon_y+50], fill=(0, 150, 60))
    # White border
    draw.ellipse([cx2-50, icon_y-50, cx2+50, icon_y+50], outline=(0, 200, 80), width=2)
    # Icon
    draw.text((cx2-15, icon_y-18), icon, fill=(255, 255, 255), font=font_body)
    # Label below
    lines = label.split('\n')
    for li, line in enumerate(lines):
        tw = draw.textlength(line, font=font_small) if hasattr(draw, 'textlength') else len(line) * 12
        draw.text((cx2 - tw//2, icon_y + 70 + li*30), line, fill=(50, 50, 50), font=font_small)

# Location section
loc_y = 920
draw.rectangle([w//2-220, loc_y, w//2+220, loc_y+2], fill=(0, 150, 60))
draw.text((w//2 - 160, loc_y+25), "\U0001F4CD Meru, Kenya", fill=(50, 50, 50), font=font_body)
draw.text((w//2 - 210, loc_y+80), "\U0001F4DE 0727 747 699", fill=(50, 80, 50), font=font_body)
draw.text((w//2 - 250, loc_y+135), "\u2709 obwochaspharmacy@gmail.com", fill=(50, 50, 50), font=font_small)

# Service list area
svc_y = 1120
draw.rectangle([100, svc_y, w-100, svc_y+2], fill=(180, 210, 180))

services = [
    "\u2713 Prescription Medicines    \u2713 Over-the-Counter Drugs",
    "\u2713 Health & Wellness Products    \u2713 Baby Care Products",
    "\u2713 Professional Consultation    \u2713 Same-Day Delivery",
]
for i, srv in enumerate(services):
    draw.text((w//2 - 480, svc_y + 20 + i*38), srv, fill=(30, 80, 30), font=font_small)

# Bottom section with white text on green
draw.text((w//2 - 320, 1550), "Open: Mon-Sat 8:00 AM - 8:00 PM", fill=(255, 255, 255), font=font_body)
draw.text((w//2 - 280, 1620), "Obwocha's Pharmacy \u00a9 2026", fill=(200, 255, 200), font=font_small)

# Save
poster_path = r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\obwocha_poster.png'
img.save(poster_path, 'PNG')
print(f"Poster saved: {poster_path}")
print(f"Size: {img.size}")
