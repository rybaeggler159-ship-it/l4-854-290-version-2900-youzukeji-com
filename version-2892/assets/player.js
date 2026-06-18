import { H as Hls } from "./hls-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
        initializePlayer(player);
    });
});

function initializePlayer(player) {
    var video = player.querySelector("video");
    var playButton = player.querySelector("[data-player-toggle]");

    if (!video) {
        return;
    }

    var source = video.getAttribute("data-src");
    var hlsInstance = null;

    function bindSource() {
        if (!source || video.getAttribute("data-source-ready") === "true") {
            return;
        }

        if (Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        }

        video.setAttribute("data-source-ready", "true");
    }

    function playVideo() {
        bindSource();

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    function toggleVideo() {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    bindSource();

    if (playButton) {
        playButton.addEventListener("click", playVideo);
    }

    video.addEventListener("click", toggleVideo);

    video.addEventListener("play", function () {
        player.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
