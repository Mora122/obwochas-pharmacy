"""Test Python bytes escaping"""
# Test 1: what bytes does this produce?
test1 = b"showEditProduct(\\'' + p.id + '\\')"
print("Test1 repr:", repr(test1))
print("Test1 bytes:", list(test1))

# Test 2: what the original code uses (from the git diff - the ORIGINAL working version)
# Original: '<button class="btn btn-primary" onclick="showEditProduct(\'' + p.id + '\')"
# In raw file: <button class="btn btn-primary" onclick="showEditProduct(\'' + p.id + '\')
test2 = b"showEditProduct(\\'' + p.id + '\\')"
print()
print("Test2 (matched original):")
print("  Repr:", repr(test2))

# What the NEW section should look like (with correct string termination)
# Line should END with ' + (no backslash, just close string and concatenate)
test3 = b"Edit</button>' +"
print()
print("Test3 (end of line):", repr(test3))
print("  bytes:", list(test3))
# Should be: Edit</button>' + (no backslash before the closing quote)

# Full template line: 
line = b"        '<button class=\"btn btn-primary\" onclick=\"showEditProduct(\\'' + p.id + '\\')\" style=\"font-size:11px;padding:6px 12px\">Edit</button>' +"
print()
print("Test4 (full line):")
print("  Repr:", repr(line))
# Verify no \' at the end (should be ' +, not \' +)
assert line.endswith(b"' +"), f"Line ends with {line[-5:]!r} not ' +"
print("  OK: ends with ' +")
