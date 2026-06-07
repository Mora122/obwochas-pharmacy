const https = require('https');

const BASE = 'https://obwochas-pharmacy.vercel.app/api';

function fetch(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const opts = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch { resolve(body); }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  // Get all products
  const res = await fetch('GET', '/products?all=true');
  if (!res.success) { console.error('Failed:', res); return; }
  
  console.log(`Found ${res.products.length} products`);
  
  let updated = 0;
  for (const p of res.products) {
    const oldImg = p.image || '';
    const newImg = `https://obwochas-pharmacy.vercel.app/images/products/${p.id}.svg`;
    if (oldImg !== newImg) {
      const result = await fetch('PATCH', `/products?id=${p.id}`, { image: newImg });
      if (result.success) {
        console.log(`✅ ${p.id} ${p.name} - image updated`);
        updated++;
      } else {
        console.log(`❌ ${p.id} - ${result.error}`);
      }
    }
  }
  console.log(`\nDone! Updated ${updated} product images`);
}

main().catch(console.error);
