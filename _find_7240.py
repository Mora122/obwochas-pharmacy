with open('checkout.html','r',encoding='utf-8') as f:
    lines=f.readlines()
for i in [153,162,291,597,619,635]:
    l = lines[i].find('7,240')
    if l >= 0:
        snippet = lines[i][max(0,l-30):l+30].encode('ascii','replace').decode()
        print(f'Line {i}: ...{snippet}...')
