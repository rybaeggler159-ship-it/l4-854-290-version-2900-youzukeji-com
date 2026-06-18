(function () {
    function selectAll(root, selector) {
        return Array.prototype.slice.call(root.querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('.mobile-toggle');
        var nav = document.querySelector('.mobile-nav');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll(hero, '.hero-slide');
        var dots = selectAll(hero, '[data-hero-dot]');
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        selectAll(document, '[data-filter-list]').forEach(function (panel) {
            var shell = panel.parentElement;
            var container = shell ? shell.querySelector('[data-card-container]') : null;
            var cards = container ? selectAll(container, '.movie-card') : [];
            var input = panel.querySelector('[data-filter-input]');
            var selects = selectAll(panel, '[data-filter-field]');
            var status = panel.querySelector('[data-filter-status]');
            var empty = shell ? shell.querySelector('[data-empty-state]') : null;

            function matches(card) {
                var keyword = normalize(input ? input.value : '');
                var text = normalize(card.getAttribute('data-filter-text'));
                if (keyword && text.indexOf(keyword) === -1) {
                    return false;
                }
                return selects.every(function (select) {
                    var value = normalize(select.value);
                    if (!value) {
                        return true;
                    }
                    var field = select.getAttribute('data-filter-field');
                    return normalize(card.getAttribute('data-' + field)) === value;
                });
            }

            function filter() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
                if (status) {
                    status.textContent = visible === 0 ? '没有匹配内容' : '筛选结果已更新';
                }
            }

            if (input) {
                input.addEventListener('input', filter);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', filter);
            });

            var query = new URLSearchParams(window.location.search).get('q');
            if (query && input) {
                input.value = query;
            }
            filter();
        });
    }

    function setupHeroSearch() {
        selectAll(document, '.hero-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('input[name="q"]');
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    window.location.href = 'search.html';
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupHeroSearch();
    });
})();

function initMoviePlayer(videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var error = document.getElementById('player-error');
    var hlsInstance = null;
    var attached = false;

    function showError() {
        if (error) {
            error.hidden = false;
        }
    }

    function hideError() {
        if (error) {
            error.hidden = true;
        }
    }

    function attachSource() {
        if (!video || attached) {
            return;
        }
        attached = true;
        hideError();
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        showError();
                    }
                }
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else {
            showError();
        }
    }

    function startPlayback() {
        if (!video) {
            return;
        }
        attachSource();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                showError();
            });
        }
    }

    if (!video) {
        return;
    }

    attachSource();

    if (overlay) {
        overlay.addEventListener('click', function () {
            startPlayback();
        });
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (overlay && video.currentTime === 0) {
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('error', function () {
        showError();
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
