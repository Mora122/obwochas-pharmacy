import sys
sys.stdout = open('presc_debug.txt', 'w', encoding='utf-8')

with open('prescription.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find sendWhatsApp function
idx = c.find("function sendWhatsApp")
if idx >= 0:
    print("sendWhatsApp function:")
    print(c[idx:idx+2000])
    print("===")

# Find form tag
form_idx = c.find("<form")
if form_idx >= 0:
    form_end = c.find("</form", form_idx)
    print(f"Form at {form_idx} to {form_end}")
    
# Find whatsapp submission logic
print("\n=== wa.me usage ===")
wa_idx = c.find("wa.me")
if wa_idx >= 0:
    print(c[max(0,wa_idx-200):wa_idx+300])

print("\n=== upload-prescription usage ===")
up_idx = c.find("upload-prescription")
if up_idx >= 0:
    print(c[max(0,up_idx-200):up_idx+500])

print("\n=== viewUrl usage ===")
vu_idx = c.find("viewUrl")
if vu_idx >= 0:
    print(c[max(0,vu_idx-200):vu_idx+500])

print("\n=== FileReader usage ===")
fr_idx = c.find("FileReader")
if fr_idx >= 0:
    print(c[max(0,fr_idx-200):fr_idx+500])

sys.stdout.close()
