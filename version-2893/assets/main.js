(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const headerSearch = document.querySelector('.header-search');

  if (menuButton && nav && headerSearch) {
    menuButton.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('is-open');
      headerSearch.classList.toggle('is-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const start = function () {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    };

    const restart = function () {
      window.clearInterval(timer);
      start();
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot));
        restart();
      });
    });

    show(0);
    start();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const textInput = filterPanel.querySelector('[data-filter-text]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const regionSelect = filterPanel.querySelector('[data-filter-region]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const cards = Array.from(document.querySelectorAll('[data-filter-list] .movie-card'));

    const filterCards = function () {
      const text = (textInput.value || '').trim().toLowerCase();
      const type = typeSelect.value;
      const region = regionSelect.value;
      const year = yearSelect.value;

      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.tags, card.textContent].join(' ').toLowerCase();
        const matched = (!text || haystack.includes(text)) &&
          (!type || card.dataset.type === type) &&
          (!region || card.dataset.region === region) &&
          (!year || card.dataset.year === year);
        card.hidden = !matched;
      });
    };

    [textInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    });
  }
}());
