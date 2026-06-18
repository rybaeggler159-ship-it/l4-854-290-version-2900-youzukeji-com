(function (global) {
  function attachSource(video, src) {
    if (global.Hls && global.Hls.isSupported()) {
      if (video._hlsPlayer) {
        video._hlsPlayer.destroy();
      }
      var hls = new global.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(global.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === global.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === global.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        hls.destroy();
      });
      video._hlsPlayer = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    video.src = src;
  }

  function bind(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var started = false;

    if (!video || !overlay || !button || !options.src) {
      return;
    }

    function start() {
      if (!started) {
        attachSource(video, options.src);
        started = true;
      }
      overlay.classList.add('is-hidden');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {});
      }
    }

    overlay.addEventListener('click', start);
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }

  global.MoviePlayer = {
    bind: bind
  };
})(window);
