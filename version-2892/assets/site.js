document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHeaderSearch();
    setupHeroCarousel();
    setupPageFilter();
});

function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
        return;
    }

    button.addEventListener("click", function () {
        nav.classList.toggle("is-open");
    });
}

function setupHeaderSearch() {
    var forms = document.querySelectorAll("[data-search-form]");

    forms.forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var base = form.getAttribute("data-search-base") || "";
            var url = base + "search.html";

            if (query) {
                url += "?q=" + encodeURIComponent(query);
            }

            window.location.href = url;
        });
    });
}

function setupHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
        return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var previousButton = carousel.querySelector("[data-hero-prev]");
    var nextButton = carousel.querySelector("[data-hero-next]");
    var currentIndex = 0;
    var timer = null;

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentIndex);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentIndex);
        });
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function previousSlide() {
        showSlide(currentIndex - 1);
    }

    function restartTimer() {
        if (timer) {
            window.clearInterval(timer);
        }

        timer = window.setInterval(nextSlide, 5000);
    }

    if (previousButton) {
        previousButton.addEventListener("click", function () {
            previousSlide();
            restartTimer();
        });
    }

    if (nextButton) {
        nextButton.addEventListener("click", function () {
            nextSlide();
            restartTimer();
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
            restartTimer();
        });
    });

    restartTimer();
}

function setupPageFilter() {
    var panel = document.querySelector("[data-page-filter]");

    if (!panel) {
        return;
    }

    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var regionSelect = panel.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var emptyMessage = document.querySelector("[data-empty-message]");

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-region"),
                card.getAttribute("data-category"),
                card.getAttribute("data-year")
            ].join(" "));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesYear = !year || card.getAttribute("data-year") === year;
            var matchesRegion = !region || card.getAttribute("data-region") === region;
            var shouldShow = matchesKeyword && matchesYear && matchesRegion;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyMessage) {
            emptyMessage.hidden = visible !== 0;
        }
    }

    [keywordInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilter);
            control.addEventListener("change", applyFilter);
        }
    });
}
