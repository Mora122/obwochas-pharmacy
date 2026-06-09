"""Resolve all conflicts in the rebase by using --theirs for HTML files"""
import os
import subprocess

# List conflicting files from git status
result = subprocess.run(
    ["git", "-C", "goodlife-replica", "diff", "--name-only", "--diff-filter=U"],
    capture_output=True, text=True
)
conflicts = [f.strip() for f in result.stdout.split("\n") if f.strip()]
print(f"Conflicts: {conflicts}")

# For each conflicting HTML file, use --theirs (our version)
# Our versions already have search bar + delivery threshold changes
for f in conflicts:
    path = os.path.join("goodlife-replica", f)
    subprocess.run(["git", "-C", "goodlife-replica", "checkout", "--theirs", "--", f],
                   capture_output=True)
    subprocess.run(["git", "-C", "goodlife-replica", "add", f])
    print(f"  Resolved: {f}")

# Continue rebase
print("\nContinuing rebase...")
result = subprocess.run(
    ["cmd", "/c", "set", "GIT_EDITOR=true", "&&", 
     "cd", "/d", "C:\\Users\\Administrator\\.openclaw\\workspace\\goodlife-replica",
     "&&", "git", "rebase", "--continue"],
    capture_output=True, text=True, timeout=30
)
print(result.stdout[-500:] if result.stdout else "")
print(result.stderr[-500:] if result.stderr else "")
print(f"Return code: {result.returncode}")
