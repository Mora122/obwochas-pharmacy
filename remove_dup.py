"""Remove duplicate script and fix delivery threshold"""
with open("goodlife-replica/account.html", "rb") as f:
    d = f.read()

# Fix delivery threshold
d = d.replace(b"KSh 2,500", b"KSh 5,000")

# Find and remove the duplicate script
# Look for the remote's duplicate login handler
idx = d.find(b"document.getElementById")
idx2 = d.find(b"handleLogin", idx)
if idx2 > 0:
    # Find the </script> before the duplicate
    prev_script = d.rfind(b"</script>", 0, idx)
    print(f"Previous </script> at byte {prev_script}")
    
    # Find the footer after the duplicate
    footer_start = d.find(b"<footer", idx)
    print(f"Footer at byte {footer_start}")
    
    # Remove from the start of the duplicate script to before the footer
    # Actually, find the <script> tag that starts the duplicate
    dup_script = d.rfind(b"<script>", idx-200, idx)
    print(f"Duplicate <script> at byte {dup_script}")
    
    if dup_script > prev_script:
        # Show what's between prev_script and footer
        between = d[prev_script:footer_start]
        print(f"Content between prev </script> and footer ({len(between)} bytes):")
        lines = between.split(b"\n")
        for i, line in enumerate(lines):
            print(f"  {i}: {repr(line[:100])}")
        
        # Remove the duplicate script block (between prev </script> and <footer)
        # prev_script points to </script> which is the end of the HEAD script
        # dup_script points to <script> which is the start of the duplicate
        # We want to keep only what's before dup_script and after dup_end
        
        # Find where the duplicate ends
        dup_end = d.find(b"</script>", dup_script)
        dup_end_plus = dup_end + len(b"</script>")
        print(f"\nDuplicate runs from {dup_script} to {dup_end_plus}")
        print(f"Content after dup: {repr(d[dup_end_plus:dup_end_plus+30])}")
        
        # Remove the duplicate + any whitespace before footer
        cleaned = d[:dup_script] + d[dup_end_plus:]
        
        with open("goodlife-replica/account.html", "wb") as f:
            f.write(cleaned)
        print(f"\nCleaned! New file size: {len(cleaned)} bytes")
else:
    print("handleLogin not found")
