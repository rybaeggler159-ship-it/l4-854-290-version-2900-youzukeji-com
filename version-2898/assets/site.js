(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-movie-search]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-kind]"));
      var empty = scope.querySelector("[data-empty-state]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-row"));
      var state = {
        category: "all",
        year: "all"
      };

      function apply() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search") || card.textContent);
          var category = card.getAttribute("data-category") || "";
          var year = card.getAttribute("data-year") || "";
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchCategory = state.category === "all" || category === state.category;
          var matchYear = state.year === "all" || year === state.year;
          var showCard = matchQuery && matchCategory && matchYear;
          card.classList.toggle("hidden", !showCard);
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var kind = chip.getAttribute("data-filter-kind");
          var value = chip.getAttribute("data-filter-value") || "all";
          state[kind] = value;
          chips.filter(function (item) {
            return item.getAttribute("data-filter-kind") === kind;
          }).forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-cover");
      var videoUrl = player.getAttribute("data-video");
      var hlsInstance = null;
      if (!video || !button || !videoUrl) {
        return;
      }

      function playVideo() {
        player.classList.add("is-playing");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      function prepareAndPlay() {
        if (video.getAttribute("data-ready") === "1") {
          playVideo();
          return;
        }
        video.setAttribute("data-ready", "1");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(videoUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal && hlsInstance) {
              hlsInstance.destroy();
              hlsInstance = null;
              video.src = videoUrl;
              playVideo();
            }
          });
          return;
        }
        video.src = videoUrl;
        playVideo();
      }

      button.addEventListener("click", function (event) {
        event.preventDefault();
        prepareAndPlay();
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
