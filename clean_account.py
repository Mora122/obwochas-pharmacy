"""Check and clean up account.html"""
import re

# Read the whole file
with open("goodlife-replica/account.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Fix delivery threshold KSh 2,500 -> KSh 5,000
old = "KSh 2,500"
new = "KSh 5,000"
count = content.count(old)
print(f"Delivery threshold '{old}' found: {count} times")

# 2. Check for duplicate script blocks after the main </script>
# Find the main script ending and check what follows
script_end = content.find("// On load: check if logged in")
if script_end >= 0:
    main_script_end = content.find("</script>", script_end)
    after_main = content[main_script_end+9:]  # after </script>
    
    # Check if there's a stray duplicate login handler script
    dup_start = after_main.find("<script>")
    if dup_start >= 0:
        dup_end = after_main.find("</script>", dup_start)
        dup_content = after_main[dup_start:dup_end+9]
        if "handleLogin" in dup_content:
            print(f"\nFound duplicate script ({len(dup_content)} bytes) with handleLogin")
            print("Removing duplicate script...")
            
            # Also check the service worker script
            sw_start = after_main.find("serviceWorker", dup_end)
            
            # Keep only the service worker script and footer
            sw_script_start = after_main.rfind("<script>", dup_end)
            after_clean = after_main[:dup_start]  # keep everything before the dup script
            
            # But we need to move service worker to after the footer
            # Find the structure
            print(f"After script: first 100 chars: {after_main[:100]!r}")
