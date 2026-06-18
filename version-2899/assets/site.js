(function () {
  var body = document.body;
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var open = mobilePanel.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.classList.toggle('menu-open', open);
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var url = './search.html';
      if (value) {
        url += '?q=' + encodeURIComponent(value);
      }
      window.location.href = url;
    });
  });

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function setHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, pos) {
      slide.classList.toggle('is-active', pos === heroIndex);
    });
    heroDots.forEach(function (dot, pos) {
      dot.classList.toggle('is-active', pos === heroIndex);
    });
  }

  if (heroSlides.length) {
    heroDots.forEach(function (dot, pos) {
      dot.addEventListener('click', function () {
        setHero(pos);
      });
    });
    window.setInterval(function () {
      setHero(heroIndex + 1);
    }, 5200);
  }

  function normalText(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyCardFilter(value) {
    var keyword = normalText(value);
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var visible = 0;
    cards.forEach(function (card) {
      var haystack = normalText((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || ''));
      var match = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });
    document.querySelectorAll('[data-empty-state]').forEach(function (node) {
      node.classList.toggle('is-visible', visible === 0);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var filterInput = document.querySelector('[data-card-filter]');

  if (filterInput) {
    if (initialQuery) {
      filterInput.value = initialQuery;
    }
    applyCardFilter(filterInput.value);
    filterInput.addEventListener('input', function () {
      applyCardFilter(filterInput.value);
    });
  }
})();
