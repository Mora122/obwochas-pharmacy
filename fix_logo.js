const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\Administrator\\.openclaw\\workspace\\goodlife-replica';

// The NEW header block (from shop.html - canonical version)
const NEW_TOP_BAR = `<div class="top-bar"><div class="left"><span>🚚 Free Delivery For orders above KSh 5,000/=</span></div><div class="right"><a href="membership.html">Health Club</a><a href="wellness.html">Wellness</a><a href="about.html">About</a><a href="blog.html">Blog</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a></div></div>`;

const NEW_HEADER = `<div class="header-nav-wrap">
<header>
  <button class="mobile-menu-toggle" onclick="document.querySelector('.main-nav').classList.toggle('open')">&#9776; Menu</button>
  <a href="index.html" class="logo"><div class="logo-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="44" height="44">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a5c2e"/>
        <stop offset="100%" stop-color="#2d8a4a"/>
      </linearGradient>
    </defs>
    <rect x="10" y="10" width="180" height="180" rx="36" fill="url(#bg)"/>
    <rect x="84" y="40" width="32" height="120" rx="6" fill="white"/>
    <rect x="40" y="84" width="120" height="32" rx="6" fill="white"/>
    <circle cx="100" cy="100" r="42" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
  </svg></div><div class="logo-text"><h1>Obwocha's <span>Pharmacy</span></h1><small>Kenya's Fastest-Growing Online Pharmacy</small></div></a>
  <div class="search-bar"><input type="text" id="searchInput" placeholder="Search products..." oninput="doSearch()"><button>Search</button></div>
  <div class="header-icons"><a href="https://wa.me/+254727747699" target="_blank" class="whatsapp-btn">📱 0727747699</a><a href="account.html">👤 Account</a><a href="wishlist.html">♥ <span class="wishlist-badge"></span></a><a href="cart.html" class="cart-icon">🛒 <span class="badge">0</span></a></div>
</header>
<nav class="main-nav"><ul><li><a href="index.html">Home</a></li><li><a href="shop.html">Shop By Category</a></li><li><a href="health-conditions.html">Shop By Condition</a></li><li><a href="brands.html">Shop By Brand</a></li><li><a href="shop.html?sale=1">Sale & Offers</a></li><li><a href="prescription.html">Submit Prescription</a></li><li><a href="services.html">Health Services</a></li><li><a href="store-locator.html">Store Locator</a></li></ul></nav>
</div>`;

// Old patterns to replace

// Pattern 1: Top bar with 2,500 delivery
const OLD_TOP_BAR = /<div class="top-bar"><div class="left">[^<]*Free Delivery[^<]*<\/div><div class="right">.*?<\/div><\/div>/;

// Pattern 2: Old logo (Group 1 - very old format with O-icon + Merus tagline)
// Everything from <header> up to the </header> or starting inside the body
const OLD_LOGO_GROUP1 = /<div class="logo"><div class="logo-icon"><a href="index.html" style="color:#fff;text-decoration:none">O<\/a><\/div><div class="logo-text"><h1><a href="index.html" style="color:var\(--primary\);text-decoration:none">Obwocha<\/a><\/h1><small>Merus Own Pharmacy<\/small><\/div><\/div>.*?<\/header>/s;

// Pattern 3: Old logo (Group 2 - same logo but without <a> wrapper in h1)
const OLD_LOGO_GROUP2 = /<div class='logo-icon'><a href="index\.html" style="color:#fff;text-decoration:none">O<\/a><\/div><div class='logo-text'><h1><a href="index\.html" style="color:var\(--primary\);text-decoration:none">Obwocha<\/a><\/h1><small>Merus Own Pharmacy<\/small><\/div><\/div>.*?<\/header>/s;

// Pattern 4: Old search-bar with placeholder without oninput
const OLD_SEARCH = /<div class="search-bar"><input type="text" placeholder="Search products\.\.\."><button>Search<\/button><\/div>/;

const files = [
  'cookies.html',
  'privacy.html',
  'terms.html',
  'membership.html',
  'wellness.html',
  'sitemap.html'
];

files.forEach(f => {
  const filePath = path.join(ROOT, f);
  let content = fs.readFileSync(filePath, 'utf8');
  let changes = 0;
  let original = content;

  // 1. Replace old top bar delivery text if it exists
  if (content.includes('2,500')) {
    content = content.replace(/2,500/g, '5,000');
    changes++;
    console.log(`${f}: updated delivery text`);
  }

  // 2. Replace old O-icon logo + Merus tagline with new header
  // First try to find and replace the entire old header block
  // Strategy: find </head><body> and look for the old header block
  
  // Find the old logo + header block boundaries
  let match;
  
  // Try Group 1 pattern: <div class="logo"><div ... O ...
  const startMarkers = [
    '<div class="logo"><div class="logo-icon"><a href="index.html" style="color:#fff;text-decoration:none">O</a></div>',
    "<div class='logo'><div class='logo-icon'><a href='index.html' style='color:#fff;text-decoration:none'>O</a></div>"
  ];
  
  for (const marker of startMarkers) {
    const startIdx = content.indexOf(marker);
    if (startIdx >= 0) {
      // Find the </header> that comes after this
      const endHeaderIdx = content.indexOf('</header>', startIdx);
      if (endHeaderIdx >= 0) {
        const oldBlock = content.substring(startIdx, endHeaderIdx + '</header>'.length);
        
        // Check if this is inside a <header> block or standalone
        // Look for preceding <header> tag
        const precedingHeader = content.lastIndexOf('<header', startIdx);
        let replaceStart = startIdx - 1; // default
        let headerBlock = oldBlock;
        
        if (precedingHeader >= 0 && precedingHeader > startIdx - 50) {
          // There's a <header> tag before the logo - expand the block
          const headerTag = content.substring(precedingHeader, content.indexOf('>', precedingHeader) + 1);
          replaceStart = precedingHeader;
          headerBlock = content.substring(precedingHeader, endHeaderIdx + '</header>'.length);
        }
        
        // Build the replacement - include the old top-bar if it was before
        const beforeBlock = content.substring(0, replaceStart);
        const afterBlock = content.substring(endHeaderIdx + '</header>'.length);
        
        // Check if there was already a top-bar before
        content = beforeBlock + NEW_TOP_BAR + '\n\n' + NEW_HEADER + afterBlock;
        
        changes++;
        console.log(`${f}: replaced old logo + header with modern header`);
        break;
      }
    }
  }

  // 3. Check if there's a standalone old-style header (Group 2 pages without <header> tag)
  // These pages have everything inline without wrapping <header>
  if (!content.includes(NEW_HEADER.substring(0, 50))) {
    // Check for old structure without <header> wrapping
    const oldSearchStart = content.indexOf('<div class="logo-icon"');
    if (oldSearchStart >= 0) {
      // Find the end of this section (usually the <nav> block)
      const navStart = content.indexOf('<nav class="main-nav"', oldSearchStart);
      const endOfSection = navStart >= 0 ? 
        content.indexOf('</nav>', navStart) + '</nav>'.length :
        content.indexOf('<div class="page-header"', oldSearchStart);
      
      if (endOfSection > oldSearchStart) {
        // Find the start - look for what comes before the logo section
        // Usually there's a <body> tag or </head> before
        const bodyClose = content.lastIndexOf('>', oldSearchStart);
        const beforeReal = content.substring(0, bodyClose + 1);
        const afterSection = content.substring(endOfSection);
        
        if (!beforeReal.includes(NEW_TOP_BAR)) {
          content = beforeReal + '\n' + NEW_TOP_BAR + '\n\n' + NEW_HEADER + '\n\n' + afterSection;
          changes++;
          console.log(`${f}: replaced inline old header with modern header`);
        }
      }
    }
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`${f}: ${changes} change(s) applied`);
  } else {
    // Debug - show what we found
    const bodyStart = content.indexOf('<body');
    if (bodyStart >= 0) {
      const afterBody = content.substring(bodyStart, bodyStart + 500);
      console.log(`${f}: NO CHANGES. Body start: ${afterBody.substring(0, 100)}...`);
    } else {
      console.log(`${f}: NO CHANGES`);
    }
  }
  console.log('---');
});
