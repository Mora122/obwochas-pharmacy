# Test how Python handles \" and \' inside double-quoted strings
import warnings

# Test 1: \' inside double-quoted string
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    s1 = 'test'  # simple single-quoted string

# Method: read the source and evaluate
# Let me just write the literal and test

# In a Python double-quoted string:
# \" is an escape for "
# \' is NOT a recognized escape (it's only for single-quoted strings)
# So in Python 3.11: \' produces the literal backslash-singlequote (DeprecationWarning)

# Test: what does \' produce in a double-quoted string?
import sys
s = "hello \' world"
print("Double-quoted with \\':", repr(s))

# Test: what does \\' produce?
s2 = "hello \\' world" 
print("Double-quoted with \\\\':", repr(s2))

# Test: what does \" produce?
s3 = "hello \" world"
print("Double-quoted with \\\":", repr(s3))

# Test the actual pattern I need: \"\'\" 
s4 = "hello \"\'\" world"
print("Double-quoted with \\\"\\'\\\":", repr(s4))

# The actual line
s5 = "        '<button onclick=\"quickStock(' + \"\'\" + p.id + \"\'\" + ',-1)\" title=\"Remove 1\">-1</button>' +"
print()
print("Full line test:")
print(repr(s5))
