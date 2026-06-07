with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('function showOrderDetail')
if idx > -1:
    print(content[idx:idx+4000])
