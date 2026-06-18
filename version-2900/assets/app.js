(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var menu = qs('[data-nav-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    show(0);
    restart();
  }

  function applyFilter(input, root) {
    var query = normalize(input.value);
    var cards = qsa('[data-title]', root || document);
    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region')
      ].join(' '));
      card.classList.toggle('is-hidden', query && text.indexOf(query) === -1);
    });
  }

  function initFilters() {
    qsa('[data-filter-input]').forEach(function (input) {
      var root = input.closest('[data-filter-root]') || document;
      input.addEventListener('input', function () {
        applyFilter(input, root);
      });
      if (input.value) {
        applyFilter(input, root);
      }
    });
  }

  function initSearchPage() {
    var input = qs('[data-search-page-input]');
    if (!input) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var value = params.get('q') || '';
    input.value = value;
    applyFilter(input, input.closest('[data-filter-root]') || document);
  }

  function connectPlayer(shell) {
    var video = qs('video', shell);
    var cover = qs('[data-play]', shell);
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hls;
    function load() {
      if (loaded || !stream) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }
    function play() {
      load();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(connectPlayer);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearchPage();
    initFilters();
    initPlayers();
  });
})();
