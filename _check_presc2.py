with open('prescription.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Find all occurrences of "function"
import re
for m in re.finditer(r'function\s+\w+', c):
    print(f"  {m.start()}: {m.group()}")

print()
print("Searching for submit-related code...")

for keyword in ["submitPrescription", "submitForm", "formSubmit", "handleSubmit"]:
    idx = c.find(keyword)
    if idx >= 0:
        print(f"Found '{keyword}' at {idx}")
        print(c[max(0,idx-100):idx+1500])
        print("---")
