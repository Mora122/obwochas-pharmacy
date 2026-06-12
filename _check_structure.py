with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\checkout.html', 'r', encoding='utf-8') as f:
    html = f.read()

idx1 = html.find('Shipping Details')
idx2 = html.find('class="payment-option"')
idx_mid = html.find('Continue to Payment', idx1, idx2)
print(f'Shipping starts: {idx1}')
print(f'Payment options start: {idx2}')
if idx_mid >= 0:
    print(f'Continue button at: {idx_mid}')
    print(f'Context: {html[idx_mid:idx_mid+150].encode("utf-8", errors="replace")}')

for term in ['payment-section', 'payment-method', 'payment-step', 'payment-area']:
    i = html.lower().find(term)
    if i >= 0:
        print(f'{term} found at: {i}')
        
# Check Choose Payment Method heading
idx_pay_heading = html.find('Choose Payment Method')
if idx_pay_heading >= 0:
    print(f'\nChoose Payment Method heading at: {idx_pay_heading}')
    parent_start = html.rfind('<div', 0, idx_pay_heading)
    if parent_start >= 0:
        print(f'Parent div starts at: {parent_start}')
        snippet = html[parent_start:idx_pay_heading+50]
        print(f'Snippet: {snippet.encode("utf-8", errors="replace")}')

# Check between shipping end and payment start
print(f'\n--- Between shipping and payment ---')
before_pay = html[idx2-300:idx2]
print(before_pay[-300:].encode("utf-8", errors="replace"))
