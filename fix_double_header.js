const fs = require('fs');
const path = require('path');
const ROOT = 'C:\\Users\\Administrator\\.openclaw\\workspace\\goodlife-replica';
const files = ['membership.html', 'wellness.html', 'sitemap.html', 'cookies.html', 'privacy.html', 'terms.html'];

files.forEach(f => {
  const filePath = path.join(ROOT, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find duplicate top-bars
  const first = content.indexOf('<div class="top-bar">');
  const second = content.indexOf('<div class="top-bar">', first + 10);
  
  if (first >= 0 && second >= 0) {
    // Find the exact end of the first top-bar (</div></div> closes .right and .top-bar)
    // It should be right before the second top-bar starts
    const firstClose = content.lastIndexOf('</div></div>', second);
    
    if (firstClose > first) {
      const before = content.substring(0, first);
      const after = content.substring(firstClose + '</div></div>'.length);
      content = before + after;
      console.log(`${f}: removed duplicate top-bar`);
    }
  }
  
  // Fix mangled emoji
  content = content.replace(/dYss /g, '🚚 ');
  
  fs.writeFileSync(filePath, content, 'utf8');
});

// Verify
console.log('\n=== VERIFICATION ===');
files.forEach(f => {
  const filePath = path.join(ROOT, f);
  const content = fs.readFileSync(filePath, 'utf8');
  const t = (content.match(/class="top-bar"/g) || []).length;
  const h = (content.match(/class="header-nav-wrap"/g) || []).length;
  const l = content.includes("Obwocha's <span>Pharmacy</span>");
  console.log(`${f}: top-bars=${t}, headers=${h}, new-logo=${l}`);
});
