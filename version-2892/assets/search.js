document.addEventListener("DOMContentLoaded", function () {
    var movies = window.MOVIE_SEARCH_DATA || [];
    var form = document.querySelector("[data-search-page-form]");
    var input = form ? form.querySelector("input[name='q']") : null;
    var categorySelect = document.querySelector("[data-search-category]");
    var yearSelect = document.querySelector("[data-search-year]");
    var regionSelect = document.querySelector("[data-search-region]");
    var results = document.querySelector("[data-search-results]");
    var emptyMessage = document.querySelector("[data-search-empty]");
    var params = new URLSearchParams(window.location.search);

    if (input) {
        input.value = params.get("q") || "";
    }

    fillSelect(yearSelect, uniqueValues(movies, "year").sort().reverse());
    fillSelect(regionSelect, uniqueValues(movies, "region").sort());

    function normalize(value) {
        return String(value || "").toLowerCase();
    }

    function fillSelect(select, values) {
        if (!select) {
            return;
        }

        values.forEach(function (value) {
            if (!value) {
                return;
            }

            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function uniqueValues(items, key) {
        var set = new Set();

        items.forEach(function (item) {
            if (item[key]) {
                set.add(item[key]);
            }
        });

        return Array.from(set);
    }

    function movieMatches(movie, keyword, category, year, region) {
        var haystack = normalize([
            movie.title,
            movie.description,
            movie.genre,
            movie.tags,
            movie.region,
            movie.category,
            movie.year
        ].join(" "));

        return (!keyword || haystack.indexOf(keyword) !== -1) &&
            (!category || movie.category === category) &&
            (!year || movie.year === year) &&
            (!region || movie.region === region);
    }

    function renderCard(movie) {
        return "" +
            "<article class="movie-card">" +
                "<a class="movie-poster-link" href="" + escapeAttribute(movie.url) + "">" +
                    "<img class="movie-poster" src="" + escapeAttribute(movie.image) + "" alt="" + escapeAttribute(movie.title) + "" loading="lazy">" +
                    "<span class="movie-play-badge">▶</span>" +
                    "<span class="movie-year-badge">" + escapeHtml(movie.year) + "</span>" +
                "</a>" +
                "<div class="movie-card-body">" +
                    "<a class="movie-card-title" href="" + escapeAttribute(movie.url) + "">" + escapeHtml(movie.title) + "</a>" +
                    "<p class="movie-card-desc">" + escapeHtml(movie.description) + "</p>" +
                    "<div class="movie-card-tags">" +
                        "<a href="" + escapeAttribute(movie.categoryUrl) + "">" + escapeHtml(movie.category) + "</a>" +
                    "</div>" +
                    "<div class="movie-card-meta">" +
                        "<span>" + escapeHtml(movie.region) + "</span>" +
                        "<span>" + escapeHtml(movie.type) + "</span>" +
                        "<span>" + escapeHtml(movie.duration) + "</span>" +
                    "</div>" +
                "</div>" +
            "</article>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, "&#96;");
    }

    function applySearch() {
        if (!results) {
            return;
        }

        var keyword = normalize(input && input.value.trim());
        var category = categorySelect ? categorySelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";
        var matched = movies.filter(function (movie) {
            return movieMatches(movie, keyword, category, year, region);
        });

        results.innerHTML = matched.map(renderCard).join("");

        if (emptyMessage) {
            emptyMessage.hidden = matched.length !== 0;
        }
    }

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applySearch();
        });
    }

    [input, categorySelect, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applySearch);
            control.addEventListener("change", applySearch);
        }
    });

    applySearch();
});
