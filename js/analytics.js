// =============================================
// Obwocha's Pharmacy — Global Analytics & Widgets
// =============================================

(function() {
  'use strict';

  // ========== #16 Google Analytics 4 ==========
  // Replace G-XXXXXXXXXX with your actual GA4 ID when ready
  (function() {
    var GA_ID = 'G-XXXXXXXXXX';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return; // Skip on local
    if (document.querySelector('script[src*="googletagmanager"]')) return; // Already loaded

    var gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_ID);
    window.gtag = gtag;
  })();

  // ========== #15 Live Chat (Tawk.to) ==========
  // Replace with your Tawk.to widget ID when ready
  (function() {
    var TAWK_PROPERTY_ID = 'YOUR_TAWK_PROPERTY_ID';
    var TAWK_WIDGET_ID = 'YOUR_TAWK_WIDGET_ID';
    if (TAWK_PROPERTY_ID === 'YOUR_TAWK_PROPERTY_ID') return; // Not configured yet
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return;

    var s1 = document.createElement('script');
    s1.async = true;
    s1.src = 'https://embed.tawk.to/' + TAWK_PROPERTY_ID + '/' + TAWK_WIDGET_ID;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
  })();

  // ========== #17 Wishlist / Favorites ==========
  // Uses localStorage, same pattern as cart.js
  var WL_KEY = 'obwochas_wishlist';

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e) { return []; }
  }

  function saveWishlist(list) {
    localStorage.setItem(WL_KEY, JSON.stringify(list));
  }

  window.wishlist = {
    get: getWishlist,
    add: function(productId) {
      var list = getWishlist();
      if (list.indexOf(productId) === -1) {
        list.push(productId);
        saveWishlist(list);
        return true;
      }
      return false;
    },
    remove: function(productId) {
      var list = getWishlist();
      var idx = list.indexOf(productId);
      if (idx > -1) {
        list.splice(idx, 1);
        saveWishlist(list);
        return true;
      }
      return false;
    },
    toggle: function(productId) {
      var list = getWishlist();
      var idx = list.indexOf(productId);
      if (idx > -1) {
        list.splice(idx, 1);
        saveWishlist(list);
        return false; // now not in list
      } else {
        list.push(productId);
        saveWishlist(list);
        return true; // now in list
      }
    },
    has: function(productId) {
      return getWishlist().indexOf(productId) > -1;
    },
    count: function() {
      return getWishlist().length;
    }
  };

  // Heart toggle click handler (delegated)
  document.addEventListener('click', function(e) {
    var heart = e.target.closest('.wishlist-heart, [data-wishlist-toggle]');
    if (!heart) return;
    e.preventDefault();
    var productId = heart.dataset.productId || heart.getAttribute('data-wishlist-toggle');
    if (!productId) return;

    var nowIn = window.wishlist.toggle(productId);
    heart.classList.toggle('active', nowIn);
    heart.setAttribute('aria-label', nowIn ? 'Remove from wishlist' : 'Add to wishlist');

    // Update badge if exists
    var badge = document.querySelector('.wishlist-badge');
    if (badge) {
      var c = window.wishlist.count();
      badge.textContent = c;
      badge.style.display = c > 0 ? 'inline' : 'none';
    }
  });

  // Update wishlist hearts on page load
  document.addEventListener('DOMContentLoaded', function() {
    var hearts = document.querySelectorAll('.wishlist-heart, [data-wishlist-toggle]');
    hearts.forEach(function(h) {
      var pid = h.dataset.productId || h.getAttribute('data-wishlist-toggle');
      if (pid && window.wishlist.has(pid)) {
        h.classList.add('active');
      }
    });

    var badge = document.querySelector('.wishlist-badge');
    if (badge) {
      var c = window.wishlist.count();
      badge.textContent = c;
      badge.style.display = c > 0 ? 'inline' : 'none';
    }
  });

  // ========== Wishlist page (wishlist.html) ==========
  if (window.location.pathname.indexOf('wishlist') > -1) {
    document.addEventListener('DOMContentLoaded', function() {
      var container = document.getElementById('wishlistItems');
      if (!container) return;
      var items = getWishlist();
      if (items.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;"><p>Your wishlist is empty.</p><a href="shop.html" class="btn btn-primary" style="display:inline-block;margin-top:12px;padding:10px 24px;text-decoration:none;">Browse Products</a></div>';
        return;
      }
      // Fetch products and filter
      fetch('/api/products')
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var products = data.products || data || [];
          var wishProducts = products.filter(function(p) { return items.indexOf(p._id || p.id || p.sku || String(p._id)) > -1; });
          if (wishProducts.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;">No products found for your wishlist.</p>';
            return;
          }
          var html = '<div class="product-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;">';
          wishProducts.forEach(function(p) {
            var id = p._id || p.id || p.sku;
            var img = p.image || 'placeholder.jpg';
            var price = typeof p.price === 'number' ? 'KSh ' + p.price.toLocaleString() : (p.price || 'KSh 0');
            html += '<div class="product-card" style="border:1px solid #e0e8e0;border-radius:12px;overflow:hidden;padding:12px;background:#fff;">';
            html += '<div style="position:relative;"><img src="products/' + img + '" alt="' + (p.name || '') + '" style="width:100%;height:160px;object-fit:cover;border-radius:8px;" loading="lazy"></div>';
            html += '<h4 style="font-size:14px;margin:8px 0 4px;">' + (p.name || '') + '</h4>';
            html += '<p style="font-size:15px;font-weight:700;color:var(--primary);margin:0 0 8px;">' + price + '</p>';
            html += '<a href="product.html?id=' + encodeURIComponent(id) + '" class="btn btn-primary" style="display:block;text-align:center;text-decoration:none;font-size:12px;padding:8px;">View Product</a></div>';
          });
          html += '</div>';
          container.innerHTML = html;
        })
        .catch(function() {
          container.innerHTML = '<p style="text-align:center;color:#c62828;">Could not load wishlist products.</p>';
        });
    });
  }

  // ========== #20 Performance: Lazy-load images ==========
  // If the page doesn't use loading="lazy" natively, add it
  document.addEventListener('DOMContentLoaded', function() {
    var imgs = document.querySelectorAll('img:not([loading])');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      // Skip very small images (icons, etc.)
      if (img.width <= 48 && img.height <= 48) continue;
      if (img.closest('.logo, [class*="logo"], header')) continue; // Skip header logo
      if (img.getAttribute('loading') !== null) continue;
      // Check if near viewport
      var rect = img.getBoundingClientRect();
      if (rect.top > window.innerHeight * 1.5) {
        img.setAttribute('loading', 'lazy');
      }
    }
  });

})();
