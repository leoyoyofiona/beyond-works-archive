/* 背景音乐：原创循环音轨，独立于主脚本，保证按钮一定能响应 */
(function () {
  if (window.__BGM_READY__) return;
  window.__BGM_READY__ = true;
  var btn = document.querySelector(".music-toggle");
  var now = document.getElementById("music-now");
  if (!btn) return;
  var audio = document.getElementById("bgm-audio");
  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "bgm-audio";
    audio.src = "assets/audio/original-loop.mp3";
    audio.loop = true;
    audio.preload = "auto";
    document.body.appendChild(audio);
  }
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  var playing = false, fadeTimer = null;
  function msg(t) {
    if (!now) return;
    now.textContent = t || "";
    now.classList.toggle("on", !!t);
  }
  function fade(target, ms) {
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    var from = audio.volume, steps = Math.max(1, Math.round(ms / 40)), i = 0;
    fadeTimer = setInterval(function () {
      i++;
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * (i / steps)));
      if (i >= steps) { clearInterval(fadeTimer); fadeTimer = null; }
    }, 40);
  }
  function stop(quiet) {
    playing = false;
    if (fadeTimer) { clearInterval(fadeTimer); fadeTimer = null; }
    try { audio.pause(); } catch (e) {}
    btn.classList.remove("playing");
    btn.setAttribute("aria-pressed", "false");
    btn.title = "原创背景音乐 · 点击播放";
    if (!quiet) msg("");
  }
  function start() {
    if (window.__byMusicStop) { try { window.__byMusicStop(true); } catch (e) {} }
    playing = true;
    btn.classList.add("playing");
    btn.setAttribute("aria-pressed", "true");
    btn.title = "背景音乐播放中 · 点击暂停";
    msg("♪ 原创背景音乐 · 点击喇叭暂停");
    audio.volume = 0;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { fade(0.65, 1500); }).catch(function () {
        playing = false;
        btn.classList.remove("playing");
        btn.setAttribute("aria-pressed", "false");
        msg("浏览器拦截了播放，请再点一次喇叭 🎵");
      });
    } else {
      fade(0.65, 1500);
    }
  }
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (playing) { stop(); return; }
    start();
  }, true);
  window.__byMusicStop = stop;
  window.__bgmAudio = audio;
})();
