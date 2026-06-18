(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var list = document.querySelector("[data-filter-list]");

    if (!panel || !list) {
      return;
    }

    var keywordInput = panel.querySelector(".filter-keyword");
    var regionSelect = panel.querySelector(".filter-region");
    var typeSelect = panel.querySelector(".filter-type");
    var cards = Array.prototype.slice.call(list.querySelectorAll(".searchable-card"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";

    if (keywordInput && q) {
      keywordInput.value = q;
    }

    function apply() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = textOf(card);
        var cardRegion = card.getAttribute("data-region") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchRegion = !region || cardRegion.indexOf(region) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var isVisible = matchKeyword && matchRegion && matchType;

        card.hidden = !isVisible;

        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keywordInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();

function initStaticPlayer(videoId, overlayId, sourceUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var hls = null;
  var attached = false;

  if (!video || !overlay || !sourceUrl) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = sourceUrl;
  }

  function play() {
    attach();
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", play);

  overlay.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      play();
    }
  });

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
