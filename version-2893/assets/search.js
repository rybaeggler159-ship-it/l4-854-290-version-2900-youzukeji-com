(function () {
  const searchIndex = window.SEARCH_INDEX || [];
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || '').trim();
  const formInput = document.querySelector('.search-page-form input[name="q"]');
  const results = document.querySelector('[data-search-results]');

  if (formInput) {
    formInput.value = query;
  }

  const escapeHtml = function (value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const renderCard = function (movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join('');

    return '<article class="movie-card">' +
      '<a href="' + escapeHtml(movie.url) + '" class="movie-poster-link">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" class="movie-poster">' +
      '<span class="poster-shade"></span>' +
      '<span class="play-badge">▶</span>' +
      '</a>' +
      '<div class="movie-card-body">' +
      '<div class="card-kicker">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.desc) + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  };

  if (results && query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matched = searchIndex.filter(function (movie) {
      const haystack = [
        movie.title,
        movie.desc,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.includes(word);
      });
    }).slice(0, 120);

    if (matched.length) {
      results.innerHTML = matched.map(renderCard).join('');
    } else {
      results.innerHTML = '<p class="empty-state">没有找到相关影片。</p>';
    }
  }
}());
