with open('goodlife-replica/fix_renderProducts_sorted.py', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('quickStock')
start = content.rfind('\n', 0, idx)
end = content.find('\n', idx)
actual_line = content[start+1:end]

print('ACTUAL line in .py file:')
print(repr(actual_line))

# Find the line() call argument  
fn_idx = actual_line.find('line(')
if fn_idx >= 0:
    # Extract the argument
    arg_text = actual_line[fn_idx+5:].strip()
    # It should end with a )
    if arg_text.endswith(')'):
        arg_text = arg_text[:-1].strip()
    # Check if it's a single-quoted or double-quoted string
    if arg_text.startswith('"') and arg_text.endswith('"'):
        inner = arg_text[1:-1]
        print()
        print('String argument (between outer quotes):')
        print(repr(inner))
        
        # Find quickStock area in the decoded string
        qs = inner.find('quickStock')
        if qs >= 0:
            print()
            print("Around quickStock:", repr(inner[qs:qs+60]))
