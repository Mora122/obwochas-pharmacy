"""Resolve remaining conflicts"""
import subprocess

result = subprocess.run(
    ["git", "-C", "goodlife-replica", "diff", "--name-only", "--diff-filter=U"],
    capture_output=True, text=True
)
conflicts = [f.strip() for f in result.stdout.split("\n") if f.strip()]
print(f"Conflicts: {conflicts}")

for f in conflicts:
    subprocess.run(["git", "-C", "goodlife-replica", "checkout", "--theirs", "--", f],
                   capture_output=True)
    subprocess.run(["git", "-C", "goodlife-replica", "add", f])
    print(f"  Resolved: {f}")

# Continue rebase - keep doing it until it succeeds
print("\nContinuing rebase...")
while True:
    result = subprocess.run(
        ["cmd", "/c", "set", "GIT_EDITOR=true", "&&", 
         "cd", "/d", "C:\\Users\\Administrator\\.openclaw\\workspace\\goodlife-replica",
         "&&", "git", "rebase", "--continue"],
        capture_output=True, text=True, timeout=30
    )
    print(result.stdout[-300:] if result.stdout else "")
    if result.stderr:
        print(result.stderr[-300:])
    print(f"Return code: {result.returncode}")
    
    if result.returncode == 0:
        print("Rebase completed!")
        break
    
    # Check for new conflicts
    result2 = subprocess.run(
        ["git", "-C", "goodlife-replica", "diff", "--name-only", "--diff-filter=U"],
        capture_output=True, text=True
    )
    new_conflicts = [f.strip() for f in result2.stdout.split("\n") if f.strip()]
    if not new_conflicts:
        print("No more conflicts but rebase failed - editor issue?")
        break
    
    print(f"New conflicts: {new_conflicts}")
    for f in new_conflicts:
        subprocess.run(["git", "-C", "goodlife-replica", "checkout", "--theirs", "--", f],
                       capture_output=True)
        subprocess.run(["git", "-C", "goodlife-replica", "add", f])
        print(f"  Resolved: {f}")
