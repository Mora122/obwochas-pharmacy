import re

with open(r'C:\Users\Administrator\.openclaw\workspace\goodlife-replica\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Features section
feat_start = html.find('class="features"')
feat_end = html.find('</section>', feat_start)
features = html[feat_start:feat_end]
cards = features.count('feature-card')
print(f'Feature cards in grid: {cards}')

has_comment = 'gets its own showcase section below' in features
print(f'Has placeholder comment: {has_comment}')

matches = list(re.finditer(r'<div class="feature-card">', features))
print(f'Feature div count: {len(matches)}')
for i, m in enumerate(matches):
    inner = features[m.start():m.start()+200]
    # Extract the h3 text
    h3_match = re.search(r'<h3>(.*?)</h3>', inner)
    if h3_match:
        print(f'  Card {i+1}: {h3_match.group(1)}')
    else:
        print(f'  Card {i+1}: (no h3 found)')

# Check the gaps - any empty div or comment in the features grid that might cause layout issues
non_card_content = features
for m in reversed(list(matches)):
    card_end = features.find('</div>', m.end()) + 6
    non_card_content = non_card_content.replace(features[m.start():card_end], '')
print(f'Non-card content (should be empty/whitespace): {repr(non_card_content[:200])}')
