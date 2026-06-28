// Global Search — Redirects to shop.html with search query
(function() {
  function initGlobalSearch() {
    var searchBars = document.querySelectorAll('.search-bar');
    if (!searchBars.length) return;

    searchBars.forEach(function(bar) {
      var input = bar.querySelector('input[type="text"]');
      var button = bar.querySelector('button');

      if (!input || !button) return;

      // Skip if already wired
      if (bar.dataset.searchWired) return;
      bar.dataset.searchWired = '1';

      function doSearch() {
        var q = input.value.trim();
        if (!q) {
          input.focus();
          input.style.borderColor = '#e74c3c';
          input.placeholder = 'Type something to search...';
          setTimeout(function() { input.style.borderColor = ''; }, 1500);
          return;
        }
        window.location.href = 'shop.html?search=' + encodeURIComponent(q);
      }

      button.addEventListener('click', doSearch);
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') doSearch();
      });
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalSearch);
  } else {
    initGlobalSearch();
  }

  // Load analytics/widgets (avoids adding another script tag to every page)
  var analyticsScript = document.createElement('script');
  analyticsScript.src = 'js/analytics.js';
  analyticsScript.defer = true;
  document.head.appendChild(analyticsScript);
})();
