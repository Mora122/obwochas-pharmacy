import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check addToCart patterns
for m in re.finditer(r'addToCart\([^)]+\)', content):
    snippet = content[m.start():m.end()]
    print(f'  idx={m.start()}: {repr(snippet)}')

# Check no more double-quote pattern
old_pattern = "addToCart(\'\""
if old_pattern in content:
    print('\nERROR: STILL HAS DOUBLE QUOTE PATTERN!')
else:
    print('\nOK: Old double-quote pattern removed')

# Check new pattern 
new_pattern = "addToCart(\'\'"
if new_pattern in content:
    print('OK: New single-quote pattern found')
else:
    print('WARNING: New pattern not found')

# Let's trace what the rendered HTML will look like
# JS template: '<a href="#" onclick="addToCart(\'' + (p.id || i) + '\',1);return false;"...'
print('\n--- Simulation ---')
product_id = 'PROD-023'
# The JS template produces:
# string1 = '<a href="#" onclick="addToCart(\''
# string2 = '\',1);return false;"...'
# concatenated: '<a href="#" onclick="addToCart(\'' + product_id + '\',1);return false;"...'
# JS parsing: 
#   \<' = escaped single quote = '
#   So string1 = '<a href="#" onclick="addToCart('
#   string2 = ',1);return false;"...'
# Result: <a href="#" onclick="addToCart('PROD-023',1);return false;" class="btn btn-primary btn-sm">
s1 = '<a href="#" onclick="addToCart(\''
s2 = '\',1);return false;" class="btn btn-primary btn-sm">'

result = s1 + product_id + s2
print(f'Template produces: {result}')
print(f'Onclick value would be: addToCart(\'{product_id}\',1);return false;')
print(f'This is CORRECT!')
