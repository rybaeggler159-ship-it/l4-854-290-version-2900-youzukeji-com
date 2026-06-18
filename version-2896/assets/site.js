(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var links = document.querySelector(".nav-links");
    if (!toggle || !links) {
      return;
    }
    toggle.addEventListener("click", function () {
      links.classList.toggle("is-open");
      document.body.classList.toggle("locked", links.classList.contains("is-open"));
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-control.prev");
    var next = hero.querySelector(".hero-control.next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function initSearchAndFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-card-group]"));
    groups.forEach(function (group) {
      var scope = group.closest(".section") || document;
      var input = scope.querySelector(".movie-search");
      var buttons = Array.prototype.slice.call(scope.querySelectorAll(".filter-btn"));
      var sort = scope.querySelector(".sort-select");
      var empty = scope.querySelector(".empty-state");
      var active = "all";

      function cards() {
        return Array.prototype.slice.call(group.querySelectorAll(".movie-card"));
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards().forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var meta = [card.dataset.type, card.dataset.region, card.dataset.genre, card.dataset.year].join(" ");
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = active === "all" || meta.indexOf(active) !== -1;
          var show = matchQuery && matchFilter;
          card.classList.toggle("hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          buttons.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          active = button.dataset.filter || "all";
          apply();
        });
      });
      if (sort) {
        sort.addEventListener("change", function () {
          var value = sort.value;
          var list = cards();
          list.sort(function (a, b) {
            if (value === "year-desc") {
              return (parseInt(b.dataset.year || "0", 10) || 0) - (parseInt(a.dataset.year || "0", 10) || 0);
            }
            if (value === "year-asc") {
              return (parseInt(a.dataset.year || "0", 10) || 0) - (parseInt(b.dataset.year || "0", 10) || 0);
            }
            return (parseInt(a.dataset.rank || "0", 10) || 0) - (parseInt(b.dataset.rank || "0", 10) || 0);
          });
          list.forEach(function (card) {
            group.appendChild(card);
          });
          apply();
        });
      }
      apply();
    });
  }

  window.siteInitPlayer = function (streamUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector(".play-overlay");
    var attached = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }
      video.src = streamUrl;
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initSearchAndFilters();
  });
})();
