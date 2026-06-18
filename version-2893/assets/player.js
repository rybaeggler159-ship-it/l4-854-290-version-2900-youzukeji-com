(function () {
  function setupMoviePlayer(source) {
    const video = document.querySelector('.movie-video');
    const overlay = document.querySelector('.player-overlay');

    if (!video || !source) {
      return;
    }

    let hls = null;
    const Hls = window.Hls;

    const attachSource = function () {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
        return;
      }

      video.src = source;
    };

    const play = async function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      video.controls = true;
      try {
        await video.play();
      } catch (error) {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      }
    };

    attachSource();

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
}());
