(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var previous = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function textMatch(card, query) {
    if (!query) {
      return true;
    }
    var joined = [
      card.getAttribute("data-title"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-region"),
      card.getAttribute("data-year"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
    return joined.indexOf(query.toLowerCase()) !== -1;
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var list = panel.nextElementSibling && panel.nextElementSibling.hasAttribute("data-card-list")
        ? panel.nextElementSibling
        : document.querySelector("[data-card-list]");
      var empty = panel.querySelector(".filter-empty");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);

      function apply() {
        var query = input ? input.value.trim() : "";
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        var visible = 0;
        cards.forEach(function (card) {
          var matches = textMatch(card, query);
          if (yearValue && card.getAttribute("data-year") !== yearValue) {
            matches = false;
          }
          if (regionValue && card.getAttribute("data-region") !== regionValue) {
            matches = false;
          }
          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
      }
      apply();
    });
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    shells.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var url = shell.getAttribute("data-hls-url");
      var hls = null;

      if (!video || !url) {
        return;
      }

      function bind() {
        if (video.getAttribute("data-ready") === "true") {
          return;
        }
        video.setAttribute("data-ready", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function start() {
        bind();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var request = video.play();
        if (request && typeof request.catch === "function") {
          request.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "true" || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
