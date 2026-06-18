(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var active = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                active = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === active);
                });
            }

            function cycle() {
                show(active + 1);
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(cycle, 5200);
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(active - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(active + 1);
                    restart();
                });
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    restart();
                });
            });

            restart();
        }

        document.querySelectorAll('.filter-scope').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var typeSelect = scope.querySelector('[data-filter-type]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get('q') || '';

            if (input && initialQuery && scope.hasAttribute('data-search-page')) {
                input.value = initialQuery;
            }

            function includes(value, query) {
                return String(value || '').toLowerCase().indexOf(query) !== -1;
            }

            function applyFilter() {
                var query = input ? input.value.trim().toLowerCase() : '';
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var shown = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var typeOk = !type || includes(card.getAttribute('data-type'), type);
                    var yearOk = !year || includes(card.getAttribute('data-year'), year);
                    var queryOk = !query || text.indexOf(query) !== -1;
                    var visible = typeOk && yearOk && queryOk;
                    card.hidden = !visible;
                    if (visible) {
                        shown += 1;
                    }
                });

                if (empty) {
                    empty.hidden = shown !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            if (typeSelect) {
                typeSelect.addEventListener('change', applyFilter);
            }
            if (yearSelect) {
                yearSelect.addEventListener('change', applyFilter);
            }
            applyFilter();
        });
    });
})();
