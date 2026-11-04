/* BEYOND · 黄家驹纪念档案 — interactions
   All audio is generated live with WebAudio (original, no copyrighted material).
   单播放器互斥 + 地区双源（海外 YouTube / 大陆 B 站）+ 经典时刻大屏，
   inspired by the LEODENG archive family. */
(function () {
  "use strict";

  var D = window.BY_DATA;
  var THUMBS = window.BY_THUMBS || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header state ---------- */
  var header = document.getElementById("site-header");
  var backtopBtn = document.getElementById("backtop");
  function refreshBackTop() {
    if (backtopBtn) backtopBtn.classList.toggle("show", window.scrollY > 600);
  }
  var onScroll = function () {
    header.classList.toggle("scrolled", window.scrollY > 10);
    refreshBackTop();
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  if (backtopBtn) {
    backtopBtn.addEventListener("click", function () { smoothScrollTo(0); });
  }

  /* ---------- theme toggle ---------- */
  var themeBtn = document.querySelector(".theme-toggle");
  var applyTheme = function (t) {
    document.documentElement.dataset.theme = t;
    themeBtn.setAttribute("aria-label", t === "night" ? "切换到白天模式" : "切换到夜间模式");
    themeBtn.title = t === "night" ? "白天模式" : "夜间模式";
    try { localStorage.setItem("by-theme", t); } catch (e) {}
  };
  var theme = "night";
  try { theme = localStorage.getItem("by-theme") || "night"; } catch (e) {}
  applyTheme(theme);
  themeBtn.addEventListener("click", function () {
    applyTheme(document.documentElement.dataset.theme === "night" ? "day" : "night");
  });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- staggered entrance for card groups ---------- */
  var gridIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); gridIO.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".grid, .quotes, .extra-grid").forEach(function (g) { gridIO.observe(g); });
  function stagger(el, i) { el.style.setProperty("--d", Math.min(i * 70, 420) + "ms"); }

  /* ---------- marquee (song titles, seamless loop) ---------- */
  var MARQUEE_SONGS = ["海闊天空", "光輝歲月", "真的愛妳", "大地", "長城", "喜歡妳", "灰色軌跡",
    "誰伴我闖蕩", "AMANI", "不再猶豫", "俾面派對", "歲月無聲", "冷雨夜", "早班火車", "情人", "再見理想"];
  function buildMarquee() {
    var track = document.getElementById("marquee-track");
    if (!track) return;
    var span = MARQUEE_SONGS.map(function (s) { return "<span>" + s + "</span>"; }).join("");
    track.innerHTML = span + span;
  }
  buildMarquee();

  /* ---------- hero portrait carousel（自动轮播 · Ken Burns） ---------- */
  var HS = D.HERO_SLIDES || [];
  var heroSlides = document.getElementById("hero-slides");
  if (heroSlides && HS.length) {
    var heroCap = document.getElementById("hero-cap");
    var heroDots = document.getElementById("hero-dots");
    var hL = document.getElementById("harrow-l"), hR = document.getElementById("harrow-r");
    var hIdx = 0, hTimer = null;
    function hBuild() {
      HS.forEach(function (s, i) {
        var d = document.createElement("div");
        d.className = "hero-slide" + (i === 0 ? " on" : "");
        d.style.backgroundImage = "url('" + s.img + "')";
        heroSlides.insertBefore(d, heroSlides.firstChild);
        var dot = document.createElement("i");
        dot.addEventListener("click", function () { hGo(i, true); });
        heroDots.appendChild(dot);
      });
      heroCap.textContent = HS[0].cap + (HS[0].sub ? " · " + HS[0].sub : "");
      heroDots.children[0].classList.add("on");
      buildHeroThumbs();
    }
    function hGo(i, user) {
      var slides = heroSlides.querySelectorAll(".hero-slide");
      hIdx = (i + HS.length) % HS.length;
      slides.forEach(function (s, k) { s.classList.toggle("on", k === hIdx); });
      Array.prototype.forEach.call(heroDots.children, function (d, k) { d.classList.toggle("on", k === hIdx); });
      var ht = document.getElementById("hero-thumbs");
      if (ht) Array.prototype.forEach.call(ht.children, function (d, k) { d.classList.toggle("on", k === hIdx); });
      heroCap.textContent = HS[hIdx].cap + (HS[hIdx].sub ? " · " + HS[hIdx].sub : "");
      hRestart(user);
    }
    function hRestart(user) {
      if (hTimer) clearTimeout(hTimer);
      if (reduced) return;
      hTimer = setTimeout(function () { hGo(hIdx + 1, false); }, 5200);
    }
    hBuild();
    hRestart(false);
    if (hL) hL.addEventListener("click", function () { hGo(hIdx - 1, true); });
    if (hR) hR.addEventListener("click", function () { hGo(hIdx + 1, true); });
    heroSlides.addEventListener("pointerenter", function () { if (hTimer) clearTimeout(hTimer); });
    heroSlides.addEventListener("pointerleave", function () { hRestart(false); });
  }

    // hero photo-wall thumbs
  function buildHeroThumbs() {
    var ht = document.getElementById("hero-thumbs");
    if (!ht || !HS.length) return;
    ht.innerHTML = "";
    HS.forEach(function (s, i) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "hthumb" + (i === 0 ? " on" : "");
      b.style.backgroundImage = "url('" + s.img + "')";
      b.title = s.cap;
      b.addEventListener("click", function () { hGo(i, true); });
      ht.appendChild(b);
    });
  }
  /* ---------- buttery smooth scroll for anchors ---------- */
  function smoothScrollTo(y) {
    if (reduced || !("requestAnimationFrame" in window)) { window.scrollTo(0, y); return; }
    var start = window.pageYOffset, diff = y - start;
    if (Math.abs(diff) < 2) return;
    var dur = Math.min(1100, 350 + Math.abs(diff) * 0.12), t0 = performance.now();
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function step(now) {
      var p = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + diff * ease(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var target = id === "#top" ? document.body : document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(id === "#top" ? 0 : target.getBoundingClientRect().top + window.pageYOffset - 78);
    });
  });

  /* ---------- starfield + embers + comets + parallax ---------- */
  var canvas = document.getElementById("stars");
  var ctx = canvas.getContext("2d");
  var stars = [], embers = [], comets = [];
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var scrollY = 0, mx = 0, my = 0;
  function sizeCanvas() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function makeStars() {
    var count = Math.min(200, Math.floor((W * H) / 8000));
    stars = Array.from({ length: count }, function () {
      return { x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + 0.3,
        a: Math.random() * 0.6 + 0.2, sp: Math.random() * 0.015 + 0.004, gold: Math.random() < 0.3 };
    });
    embers = Array.from({ length: Math.min(26, Math.floor((W * H) / 60000)) }, function () {
      return { x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.6 + 0.6,
        vy: Math.random() * 0.25 + 0.08, ph: Math.random() * Math.PI * 2, a: Math.random() * 0.5 + 0.3 };
    });
    comets = [];
  }
  function spawnComet() {
    comets.push({ x: Math.random() * W, y: Math.random() * H * 0.4, vx: Math.random() * 5 + 4, vy: Math.random() * 2.2 + 1.6, life: 1, max: 90 + Math.random() * 50 });
  }
  function drawStars(t) {
    ctx.clearRect(0, 0, W, H);
    var par = scrollY * 0.05, mxo = (mx - W / 2) * 0.015, myo = (my - H / 2) * 0.015;
    // stars
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var sy = (s.y + par) % H;
      var tw = Math.sin(t * 0.001 * s.sp * 60 + s.x) * 0.5 + 0.5;
      ctx.beginPath(); ctx.arc(s.x + mxo, sy + myo, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.gold ? "rgba(233,200,107," + (s.a * (0.4 + 0.6 * tw)) + ")" : "rgba(200,205,215," + (s.a * (0.4 + 0.6 * tw)) + ")";
      ctx.fill();
    }
    // rising gold embers (slow ambient sparkle)
    for (var j = 0; j < embers.length; j++) {
      var e = embers[j];
      e.y -= e.vy; if (e.y < -10) { e.y = H + 10; e.x = Math.random() * W; }
      var fl = 0.5 + 0.5 * Math.sin(t * 0.001 * 4 + e.ph);
      ctx.beginPath(); ctx.arc(e.x + mxo * 0.6, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(233,200,107," + (e.a * (0.35 + 0.45 * fl)) + ")";
      ctx.fill();
    }
    // occasional shooting stars
    if (!reduced && Math.random() < 0.006 && comets.length < 2) spawnComet();
    for (var c = comets.length - 1; c >= 0; c--) {
      var co = comets[c];
      co.life -= 1; co.x += co.vx; co.y += co.vy;
      ctx.strokeStyle = "rgba(233,200,107," + Math.max(0, co.life / co.max) + ")";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(co.x, co.y);
      ctx.lineTo(co.x - co.vx * 7, co.y - co.vy * 7);
      ctx.stroke();
      if (co.life <= 0) comets.splice(c, 1);
    }
    // aurora follows the pointer, very softly
    var au = document.getElementById("aurora");
    if (au) au.style.transform = "translate3d(" + ((mx - W / 2) * -0.03).toFixed(2) + "px," + ((my - H / 2) * -0.03).toFixed(2) + "px,0)";
  }
  function loop(t) { drawStars(t); requestAnimationFrame(loop); }
  sizeCanvas(); makeStars();
  if (reduced) { drawStars(0); } else { requestAnimationFrame(loop); }
  window.addEventListener("resize", function () { sizeCanvas(); makeStars(); });
  window.addEventListener("scroll", function () { scrollY = window.pageYOffset; }, { passive: true });
  window.addEventListener("pointermove", function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

  /* ---------- filmstrip timeline ---------- */
  var track = document.getElementById("strip-track");
  var prevBtn = document.querySelector(".strip-btn.prev");
  var nextBtn = document.querySelector(".strip-btn.next");
  var step = function () {
    var node = track.querySelector(".node");
    return node ? node.offsetWidth + 18 : 0;
  };
  prevBtn.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
  nextBtn.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
  var isDown = false, startX = 0, startScroll = 0;
  track.addEventListener("pointerdown", function (e) {
    if (reduced) return;
    isDown = true; track.classList.add("dragging");
    startX = e.clientX; startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", function (e) {
    if (!isDown) return;
    track.scrollLeft = startScroll - (e.clientX - startX);
  });
  var up = function () { isDown = false; track.classList.remove("dragging"); };
  track.addEventListener("pointerup", up); track.addEventListener("pointercancel", up);
  track.tabIndex = 0;
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") track.scrollBy({ left: -step(), behavior: "smooth" });
    if (e.key === "ArrowRight") track.scrollBy({ left: step(), behavior: "smooth" });
  });
  // 时间长廊自动滚动：单向向左 · 无缝循环（内容复制一份，到头瞬时回起点，视觉不断）
  if (!reduced) {
    // 复制一份节点 → 让滚动宽度翻倍，回绕时看不出跳变
    if (!track.__cloned) {
      track.innerHTML = track.innerHTML + track.innerHTML;
      track.__cloned = true;
    }
    var autoPaused = false;
    var halfTl = function () {
      var half = Math.max(0, track.scrollWidth - track.clientWidth);
      return half / 2; // 第一份内容可滚动的总长
    };
    var autoT = setInterval(function () {
      if (autoPaused || document.hidden) return;
      var max = track.scrollWidth - track.clientWidth;
      if (max <= 0) return;
      var bound = halfTl();
      var next = track.scrollLeft + 2.3;
      if (next >= bound && bound > 0) track.scrollLeft = next - bound; // 回到第一份起点，无缝续走
      else track.scrollLeft = next;
    }, 24);
    track.addEventListener("pointerenter", function () { autoPaused = true; });
    track.addEventListener("pointerleave", function () { autoPaused = false; });
    track.addEventListener("pointerdown", function () { autoPaused = true; });
    var resumeT = null;
    track.addEventListener("pointerup", function () { clearTimeout(resumeT); resumeT = setTimeout(function () { autoPaused = false; }, 900); });
    track.addEventListener("pointercancel", function () { autoPaused = false; });
  }

  /* ============================================================
     02 · 作品档案 —— 翻转海报卡（正面海报大图，再点翻回）
     ============================================================ */
  var albumsGrid = document.getElementById("albums-grid");
  function buildAlbums() {
    albumsGrid.innerHTML = "";
    D.ALBUMS.forEach(function (a, ai) {
      var card = document.createElement("article");
      card.className = "flip-card";
      card.dataset.id = a.id;
      stagger(card, ai);
      card.innerHTML =
        '<div class="flip-inner">' +
          '<div class="flip-face flip-front">' +
            '<img class="poster" src="' + a.poster + '" alt="' + a.title + ' · 原版封面" loading="lazy" />' +
            '<span class="tag">' + a.tag + '</span>' +
            '<div class="hint"><span>点击翻面</span><span>↻</span></div>' +
          '</div>' +
          '<div class="flip-face flip-back">' +
            '<span class="byear">' + a.year + ' · ' + a.tag + '</span>' +
            '<h3>' + a.title + '</h3>' +
            '<p class="desc">' + a.desc + '</p>' +
            '<ul>' + a.facts.map(function (f) { return "<li>" + f + "</li>"; }).join("") + '</ul>' +
            '<p class="songs">' + a.songs + '</p>' +
            '<p class="back-hint">点击翻回正面 ↻</p>' +
          '</div>' +
        '</div>';
      card.addEventListener("click", function () {
        albumsGrid.querySelectorAll(".flip-card.flipped").forEach(function (o) { if (o !== card) o.classList.remove("flipped"); });
        card.classList.toggle("flipped");
      });
      if (!reduced) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.setProperty("--ty", (px * 9).toFixed(2) + "deg");
          card.style.setProperty("--tx", (-py * 9).toFixed(2) + "deg");
        });
        card.addEventListener("pointerleave", function () {
          card.classList.remove("flipped");
          card.style.setProperty("--tx", "0deg"); card.style.setProperty("--ty", "0deg");
        });
      }
      albumsGrid.appendChild(card);
    });
    // 点击卡片以外的区域 → 所有卡片自动翻回
    document.addEventListener("pointerdown", function (e) {
      if (e.target && e.target.closest && !e.target.closest(".flip-card")) {
        albumsGrid.querySelectorAll(".flip-card.flipped").forEach(function (o) { o.classList.remove("flipped"); });
      }
    });
  }
  buildAlbums();

  /* ============================================================
     04 · 视听馆 & 05 · 现场 —— 地区切换 + 视频嵌入（懒加载）
     ============================================================ */
  var region = "ow";
  try { region = localStorage.getItem("by-region") || ((location.hostname || "").indexOf("dengzhimin.cn") !== -1 ? "cn" : "ow"); } catch (e) {}
  var regionBtns = document.querySelectorAll(".region-toggle button");
  var userPickedRegion = false; // 用户本次手动切换过则尊重用户选择
  var watchNote = document.getElementById("watch-note");
  var videoGrid = document.getElementById("video-grid");
  var liveGrid = document.getElementById("live-grid");
  var lazyIO = null;
  var KIND_LABEL = { mv: "MV·短篇", live: "现场", doc: "纪录", bts: "幕后 BTS", other: "其他" };

  function embedSrc(v, r) {
    if (r === "cn") return v.bv ? "https://player.bilibili.com/player.html?isOutside=true&bvid=" + v.bv + "&autoplay=1&danmaku=0" : null;
    return v.yt ? "https://www.youtube.com/embed/" + v.yt + "?rel=0" : null;
  }
  function fallbackUrl(v, r) {
    var q = encodeURIComponent(v.kw || v.title);
    if (r === "cn") return v.bv ? "https://www.bilibili.com/video/" + v.bv : "https://search.bilibili.com/all?keyword=" + q;
    if (v.yt) return "https://www.youtube.com/watch?v=" + v.yt;
    if (v.bv) return "https://www.bilibili.com/video/" + v.bv;
    return "https://search.bilibili.com/all?keyword=" + q;
  }
  function iframeSrcFor(v, plat) {
    if (!plat || plat === "auto") plat = v.bv ? "bv" : "yt";
    if (plat === "bv" && v.bv) return "https://player.bilibili.com/player.html?isOutside=true&bvid=" + v.bv + "&autoplay=1&danmaku=0&high_quality=1";
    if (plat === "yt" && v.yt) return "https://www.youtube.com/embed/" + v.yt + "?rel=0&autoplay=1";
    return v.yt ? "https://www.youtube.com/embed/" + v.yt + "?rel=0&autoplay=1" : "";
  }
  function sourceChips(v) {
    var h = "";
    if (v.yt) h += '<button type="button" class="psrc" data-p="yt">▶ YouTube</button>';
    if (v.bv) h += '<button type="button" class="psrc" data-p="bv">▶ B站</button>';
    return h ? '<span class="psrcs">' + h + "</span>" : "";
  }
  function pickSource(v) {
    // 海外默认 YouTube；YouTube 打不开时用户可点卡上 ▶ B站 备用钮
    if (region === "cn") return v.bv ? "bv" : "search";
    if (v.yt) return "yt";
    return v.bv ? "bv" : "search";
  }

  function playSrc(v, r) {
    if (r === "cn") return v.bv ? "https://player.bilibili.com/player.html?isOutside=true&bvid=" + v.bv + "&autoplay=1&danmaku=0&high_quality=1" : null;
    return v.yt ? "https://www.youtube.com/embed/" + v.yt + "?rel=0&autoplay=1" : null;
  }
  function posterForVideo(v) {
    var byId = { v1: "otw", v2: "thriller", v3: "thriller", v4: "thriller", v5: "bad", v6: "bad", v7: "bad", v8: "dangerous", v9: "dangerous", v10: "dangerous", v11: "history", v12: "history", v13: "kop", v14: "dangerous", v15: "bad", v16: "history", v17: "history", v18: "invincible", v19: "thisisit" };
    var a = D.ALBUMS.filter(function (x) { return x.id === byId[v.id]; })[0];
    return a ? a.poster : "";
  }
  function watchThumb(v) { return v.yt ? "https://i.ytimg.com/vi/" + v.yt + "/hqdefault.jpg" : ""; }
  function makeWatchCard(v, r) {
    var card = document.createElement("article");
    card.className = "watch-card";
    // 两层背景：视频专属缩略图在上、专辑封面在下；前者加载失败时后者仍可见，避免黑块/千卡一图
    var poster = THUMBS[v.bv] || v.img || watchThumb(v);
    var cover = posterForVideo(v);
    var bgLayers = [];
    if (poster) bgLayers.push("url('" + poster + "')");
    if (cover && cover !== poster) bgLayers.push("url('" + cover + "')");
    var bg = bgLayers.length ? "background-image:" + bgLayers.join(",") : "";
    var frame = '<div class="watch-frame w-prev"><div class="wf-bg" style="' + bg + '"></div>' +
      '<button class="wf-play" type="button" aria-label="播放"><span>▶</span></button></div>';
    card.innerHTML = frame +
      '<div class="watch-body">' +
        '<div class="w-meta"><span>' + v.year + '</span><span class="k">' + (KIND_LABEL[v.kind] || "视频") + '</span></div>' +
        '<h3>' + v.title + '</h3><p>' + v.note + '</p>' +
        sourceChips(v) +
        '<a class="go" href="' + fallbackUrl(v, r) + '" target="_blank" rel="noopener">在 B 站打开 ↗</a>' +
      "</div>";
    var wf0 = card.querySelector(".watch-frame");
    wf0.__poster = wf0.innerHTML;
    function playIn(plat) {
      var src = iframeSrcFor(v, plat);
      if (!src) { window.open(fallbackUrl(v, r), "_blank"); return; }
      var wf = card.querySelector(".watch-frame");
      stopActiveFrame(); // 互斥：先停掉其它卡片 / 大屏 / 背景音乐
      wf.innerHTML = '<iframe src="' + src + '" title="' + v.title + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      wf.classList.add("playing");
      activeFrame = wf;
    }
    card.querySelector(".wf-play").addEventListener("click", function (e) { e.stopPropagation(); var ps = pickSource(v); if (ps === "search") { window.open(fallbackUrl(v, r), "_blank"); return; } playIn(ps); });
    wf0.addEventListener("click", function (e) {
      if (e.target.closest && (e.target.closest(".psrc") || e.target.closest("iframe"))) return;
      if (wf0.classList.contains("playing")) return;
      var ps = pickSource(v);
      if (ps === "search") { window.open(fallbackUrl(v, r), "_blank"); return; }
      playIn(ps);
    });
    card.querySelectorAll(".psrc").forEach(function (b) {
      b.addEventListener("click", function () { playIn(b.getAttribute("data-p")); });
    });
    return card;
  }
  var activeFrame = null;
  var momentStopFn = null; // 由「经典时刻」注册：任一卡片开播前先停掉大屏（互斥）
  var replayStopFn = null; // 由「经典现场回放大窗口」注册：开播其它内容时收起弹窗
  function stopActiveFrame() {
    if (replayStopFn) { try { replayStopFn(); } catch (e) {} }
    if (momentStopFn) { try { momentStopFn(); } catch (e) {} }
    stopMusic(true); // 互斥：视频/大屏开播时背景音乐一并停掉
    if (window.__byMusicStop) { try { window.__byMusicStop(true); } catch (e) {} }
    if (activeFrame && activeFrame.__poster !== undefined) {
      activeFrame.innerHTML = activeFrame.__poster;
      activeFrame.classList.remove("playing");
    }
    activeFrame = null;
  }
  function renderVideos() {
    var tab = document.querySelector(".tab.active");
    var kind = tab ? tab.getAttribute("data-kind") : "all";
    // 现场(live)类视频只在下方“现场演唱会 · 经典现场回放”展示一次，视听馆不再重复
    var list = kind === "all"
      ? D.VIDEOS.filter(function (v) { return v.kind !== "live"; })
      : D.VIDEOS.filter(function (v) { return v.kind === kind && v.kind !== "live"; });
    videoGrid.innerHTML = "";
    list.forEach(function (v, vi) { var c = makeWatchCard(v, region); stagger(c, vi); videoGrid.appendChild(c); });
    liveGrid.innerHTML = "";
    D.VIDEOS.filter(function (v) { return v.kind === "live"; }).forEach(function (v, vi) { var c = makeLiveCard(v, true); stagger(c, vi); liveGrid.appendChild(c); });
  }
  function makeLiveCard(v, replay) {
    var card = document.createElement("article");
    card.className = "watch-card live-card" + (replay ? " replay-card" : "");
    card.innerHTML =
      '<div class="live-poster">' +
        '<img src="' + (THUMBS[v.bv] || v.img) + '" alt="' + v.title + ' · 现场画面" loading="lazy" onerror="this.style.opacity=0" />' +
        '<button class="live-play" type="button" aria-label="播放现场"><span>▶</span></button>' +
      "</div>" +
      '<div class="watch-body">' +
        '<div class="w-meta"><span>' + v.year + '</span><span class="k">现场 LIVE</span></div>' +
        '<h3>' + v.title + "</h3><p>" + v.note + "</p>" +
        sourceChips(v) +
        '<a class="go" href="' + fallbackUrl(v, region) + '" target="_blank" rel="noopener">在 B 站打开 ↗</a>' +
      "</div>";
    var lp0 = card.querySelector(".live-poster");
    lp0.__poster = lp0.innerHTML;
    function playLive(plat) {
      var src = iframeSrcFor(v, plat);
      if (!src) { window.open(fallbackUrl(v, region), "_blank"); return; }
      var poster = card.querySelector(".live-poster");
      stopActiveFrame(); // 互斥：先停掉其它卡片 / 大屏 / 背景音乐
      poster.innerHTML = '<iframe src="' + src + '" title="' + v.title + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      activeFrame = poster;
    }
    function clickPlay() {
      var ps = pickSource(v);
      if (replay) {
        // 经典现场回放：点卡片→弹出稍大的播放窗口
        if (ps === "search") { window.open(fallbackUrl(v, region), "_blank"); return; }
        openReplay(v, ps);
        return;
      }
      if (ps === "search") { window.open(fallbackUrl(v, region), "_blank"); return; }
      playLive(ps);
    }
    card.querySelector(".live-play").addEventListener("click", function (e) { e.stopPropagation(); clickPlay(); });
    card.querySelector(".live-poster").addEventListener("click", function (e) {
      if (e.target.closest(".live-play") || e.target.closest("a") || e.target.closest(".psrc")) return;
      if (!replay && card.querySelector(".live-poster iframe")) return;
      clickPlay();
    });
    if (replay) {
      // 弹窗模式下，点海报图片（非按钮/链接）也打开大窗口
      card.querySelector(".live-poster").addEventListener("click", function (e) {
        if (e.target.closest(".live-play") || e.target.closest("a") || e.target.closest(".psrc")) return;
        clickPlay();
      });
    }
    card.querySelectorAll(".psrc").forEach(function (b) {
      b.addEventListener("click", function (e) {
        if (replay) { e.stopPropagation(); openReplay(v, b.getAttribute("data-p")); return; }
        playLive(b.getAttribute("data-p"));
      });
    });
    return card;
  }
  function setupLazy() {
    if (lazyIO) lazyIO.disconnect();
    lazyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var iframe = en.target.querySelector("iframe[data-src]");
          if (iframe && !iframe.getAttribute("src")) iframe.setAttribute("src", iframe.getAttribute("data-src"));
          lazyIO.unobserve(en.target);
        }
      });
    }, { rootMargin: "300px" });
    document.querySelectorAll(".watch-card").forEach(function (c) { lazyIO.observe(c); });
  }
  function applyRegion() {
    regionBtns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-region") === region); });
    if (watchNote) watchNote.innerHTML = "当前地区：<strong>" + (region === "cn" ? "中国大陆" : "海外") + "</strong> · " + (region === "cn" ? "优先使用 B 站源（现场影像见下方「现场演唱会」）" : "优先使用 YouTube 官方源（现场影像见下方「现场演唱会」）");
    try { localStorage.setItem("by-region", region); } catch (e) {}
    renderVideos();
    if (typeof window.__mjOnRegion === "function") window.__mjOnRegion();
  }
  regionBtns.forEach(function (b) {
    b.addEventListener("click", function () { userPickedRegion = true; region = b.getAttribute("data-region"); applyRegion(); });
  });
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("active"); });
      t.classList.add("active"); renderVideos();
    });
  });
  applyRegion();

  // 首次访问自动识别地区：大陆用户默认走 B 站源
  (function autoRegion() {
    var saved = null;
    try { saved = localStorage.getItem("by-region"); } catch (e) {}
    // 即使之前保存过“海外”，只要本次识别到国内就强制切回 B 站源
    var forced = false;
    function tryGeo(urls, i) {
      if (i >= urls.length) return;
      if (typeof fetch !== "function") { region = "cn"; applyRegion(); return; }
      var ac = typeof AbortController !== "undefined" ? new AbortController() : null;
      var to = setTimeout(function () { if (ac) ac.abort(); }, 3500);
      fetch(urls[i], { signal: ac ? ac.signal : undefined })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          var c = String(d.country_code || (d.country && (d.country === "中国" ? "CN" : d.country_code)) || "").toUpperCase();
          if (c === "CN" || c === "HK" || c === "MO") { region = "cn"; try { localStorage.setItem("by-region", "cn"); } catch (e) {} applyRegion(); }
        }).catch(function () {
          if (i + 1 < urls.length) tryGeo(urls, i + 1);
          else { region = "cn"; try { localStorage.setItem("by-region", "cn"); } catch (e) {} applyRegion(); }
        }).finally(function () { clearTimeout(to); });
    }
    tryGeo(["https://ipapi.co/json/", "https://ipinfo.io/json", "https://ip.useragentinfo.com/json"], 0);
  })();

  // 附加兜底：若当前被识别为“海外”但 YouTube 实际不可达（大陆网络），自动切回 B 站源
  (function ytReachProbe() {
    if (region !== "ow") return;
    if (typeof fetch !== "function") return;
    var ac = typeof AbortController !== "undefined" ? new AbortController() : null;
    var to = setTimeout(function () { if (ac) ac.abort(); }, 4500);
    fetch("https://www.youtube.com/generate_204", { mode: "no-cors", signal: ac ? ac.signal : undefined })
      .then(function () { clearTimeout(to); })   // YouTube 可达，保持海外源
      .catch(function () {
        clearTimeout(to);
        // 可能只是瞬时失败：交给后续 IP 探测决定；仅当仍为 ow 且明显是大陆网时切换
        setTimeout(function () {
          if (userPickedRegion || region !== "ow") return;
          region = "cn";
          try { localStorage.setItem("by-region", "cn"); } catch (e) {}
          applyRegion();
          var nn = document.getElementById("music-now");
          if (nn) { nn.textContent = "检测到 YouTube 不可达，已自动切换到 B 站源（可点右上角手动切回海外）"; nn.classList.add("on"); setTimeout(function () { nn.classList.remove("on"); }, 6000); }
        }, 900);
      });
  })();

  /* ============================================================
     Background music（点喇叭即内部轮播 · 无弹窗 · 与视频互斥）
     ============================================================ */
  var MUSIC = D.MUSIC || [];
  var musicBtn = document.querySelector(".music-toggle");
  var mpNow = document.getElementById("music-now");
  var mpFrame = document.getElementById("mp-frame");
  var mi = 0, ytPlayer = null, cnTimer = null, mPlaying = false, nowTimer = null;

  function mpCur() { return MUSIC[mi]; }
  function setPlayIcon(p) {
    if (!musicBtn) return;
    musicBtn.classList.toggle("playing", !!p);
    musicBtn.setAttribute("aria-label", p ? "暂停背景音乐（轮播）" : "播放背景音乐（轮播）");
    musicBtn.title = p ? "背景音乐播放中 · 点击暂停" : "背景音乐 · 点击播放";
  }
  function renderSongInfo() {
    if (mpNow) {
      mpNow.textContent = (mPlaying ? "♪ " : "") + mpCur().title + " · " + mpCur().year + (region === "cn" ? "（B站）" : "（YouTube）");
      mpNow.classList.toggle("on", !!mPlaying);
    }
  }
  function setNowMsg(t, autoHide) {
    if (!mpNow) return;
    if (nowTimer) { clearTimeout(nowTimer); nowTimer = null; }
    mpNow.textContent = t || "";
    mpNow.classList.toggle("on", !!t);
    if (t && autoHide) nowTimer = setTimeout(function () {
      if (mpNow && !mPlaying) { mpNow.classList.remove("on"); nowTimer = null; }
    }, 4200);
  }
  function ensureYtTarget() {
    if (!document.getElementById("mp-yt")) {
      var d = document.createElement("div");
      d.id = "mp-yt"; d.className = "mp-yt";
      mpFrame.appendChild(d);
    }
  }
  function ensureYT() {
    return new Promise(function (res, rej) {
      if (window.YT && YT.Player) return res();
      var done = false;
      var to = setTimeout(function () { if (!done) { done = true; rej(new Error("yt-timeout")); } }, 6000);
      var s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onload = function () {
        (function wait() {
          if (window.YT && YT.Player) { if (!done) { done = true; clearTimeout(to); res(); } }
          else setTimeout(wait, 60);
        })();
      };
      s.onerror = function () { if (!done) { done = true; clearTimeout(to); rej(new Error("yt-blocked")); } };
      document.head.appendChild(s);
    });
  }
  function playSong(autoplay) {
    if (!MUSIC.length) return;
    stopActiveFrame(); // 互斥：开播背景音乐前先停掉卡片/大屏视频
    if (cnTimer) { clearTimeout(cnTimer); cnTimer = null; }
    var cur = mpCur();
    if (region === "cn") {
      if (mpFrame) {
        mpFrame.innerHTML = "";
        ensureYtTarget(); // 保留容器，供切到海外时复用
      }
      if (!cur.bv) {
        mPlaying = false; setPlayIcon(false);
        setNowMsg("该曲暂无 B 站源 · 点击图标在 B 站搜索");
        try { window.open("https://search.bilibili.com/all?keyword=" + encodeURIComponent(cur.title), "_blank"); } catch (e) {}
        return;
      }
      var ifr = document.createElement("iframe");
      ifr.className = "mp-bili";
      ifr.setAttribute("src", "https://player.bilibili.com/player.html?isOutside=true&bvid=" + cur.bv + "&autoplay=1&danmaku=0&high_quality=1&muted=0");
      ifr.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture");
      ifr.setAttribute("allowfullscreen", "true");
      mpFrame.appendChild(ifr);
      mPlaying = true; setPlayIcon(true); renderSongInfo();
      cnTimer = setTimeout(next, (cur.durSec + 3) * 1000);
    } else {
      if (mpFrame) mpFrame.innerHTML = "";
      ensureYtTarget();
      ensureYT().then(function () {
        if (!ytPlayer) {
          ytPlayer = new YT.Player("mp-yt", {
            videoId: cur.yt,
            playerVars: { autoplay: autoplay ? 1 : 0, playsinline: 1, rel: 0 },
            events: {
              onReady: function () { if (autoplay) { try { ytPlayer.playVideo(); } catch (e) {} } },
              onStateChange: function (e) {
                if (e.data === YT.PlayerState.ENDED) next();
                else if (e.data === YT.PlayerState.PLAYING) { mPlaying = true; setPlayIcon(true); renderSongInfo(); }
                else if (e.data === YT.PlayerState.PAUSED) { mPlaying = false; setPlayIcon(false); }
              },
              onError: function () {
                mPlaying = false; setPlayIcon(false);
                setNowMsg("YouTube 无法播放：请切换到「中国大陆」使用 B 站源");
              }
            }
          });
        } else {
          ytPlayer.loadVideoById(cur.yt, 0, "large");
          if (autoplay) ytPlayer.playVideo();
          else ytPlayer.pauseVideo();
        }
      }).catch(function () {
        mPlaying = false; setPlayIcon(false);
        setNowMsg("YouTube 不可达：请点击右上角切换「中国大陆」使用 B 站源");
      });
    }
  }
  function stopMusic(byVideo) {
    if (cnTimer) { clearTimeout(cnTimer); cnTimer = null; }
    if (ytPlayer) { try { ytPlayer.stopVideo(); } catch (e) {} }
    var bili = mpFrame ? mpFrame.querySelector("iframe.mp-bili") : null;
    if (bili) { try { bili.src = "about:blank"; } catch (e) {} try { bili.remove(); } catch (e) {} }
    var wasPlaying = mPlaying;
    mPlaying = false; setPlayIcon(false);
    if (byVideo && wasPlaying) setNowMsg("背景音乐已暂停（播放视频时自动停）♪ 点右上角喇叭可继续", true);
    else if (!byVideo) setNowMsg("");
  }
  function next() { if (!MUSIC.length) return; mi = (mi + 1) % MUSIC.length; playSong(true); }
  function prev() { if (!MUSIC.length) return; mi = (mi - 1 + MUSIC.length) % MUSIC.length; playSong(true); }
  // 点喇叭：内部循环播放 / 暂停，不弹窗
  if (musicBtn && MUSIC.length) musicBtn.addEventListener("click", function () {
    if (mPlaying) stopMusic();
    else playSong(true);
  });
  // region switch while music is playing: re-render current song with new source
  // （仅当音乐本就在播；若它被视频互斥暂停则不动，避免抢走正在播放的视频）
  window.__mjOnRegion = function () {
    if (mPlaying && MUSIC && MUSIC.length) playSong(true);
  };

  /* ============================================================
     05 · 现场演唱会 —— 巡演时代卡片（每张可点播放，双端源）
     ============================================================ */
  var concertCards = document.getElementById("concert-cards");
  function makeConcertCard(c, ci) {
    var card = document.createElement("article");
    card.className = "tour concert-card" + (c.yt || c.bv ? " has-video" : "");
    stagger(card, ci);
    var kw = encodeURIComponent(c.kw || c.title);
    var poster = THUMBS[c.bv] || c.img || "";
    var media = c.yt || c.bv
      ? '<div class="tour-media"><div class="tour-img" style="background-image:url(\'' + poster + '\')"></div>' +
        '<button class="tour-play" type="button" aria-label="播放现场"><span>▶</span></button>' +
        sourceChips(c) + '</div>'
      : '<div class="tour-media"><div class="tour-img" style="background-image:url(\'' + poster + '\')"></div></div>';
    card.innerHTML = media +
      '<div class="tour-body">' +
        (c.tag ? '<span class="t-tag">' + c.tag + "</span>" : "") +
        '<h3>' + c.title + '</h3>' +
        (c.years ? '<time>' + c.years + "</time>" : "") +
        '<p>' + c.desc + "</p>" +
        (c.yt || c.bv
          ? '<span class="psrcs"><a class="go" href="' + fallbackUrl(c, region) + '" target="_blank" rel="noopener">在 B 站打开 ↗</a></span>'
          : '<span class="psrcs"><a class="go" href="https://www.bilibili.com/search?keyword=' + kw + '" target="_blank" rel="noopener">在 B 站搜现场影像 ↗</a></span>') +
      "</div>";
    if (c.yt || c.bv) {
      var tm = card.querySelector(".tour-media");
      if (tm) tm.__poster = tm.innerHTML;
      function playTour(plat) {
        var src = iframeSrcFor(c, plat);
        if (!src) { window.open(fallbackUrl(c, region), "_blank"); return; }
        var host = card.querySelector(".tour-media");
        stopActiveFrame(); // 互斥
        host.innerHTML = '<iframe src="' + src + '" title="' + c.title + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
        host.classList.add("playing");
        activeFrame = host;
      }
      var pb = card.querySelector(".tour-play");
      if (pb) pb.addEventListener("click", function (e) { e.stopPropagation(); var ps = pickSource(c); if (ps === "search") { window.open(fallbackUrl(c, region), "_blank"); return; } playTour(ps); });
      var tmedia = card.querySelector(".tour-media");
      if (tmedia) tmedia.addEventListener("click", function (e) {
        if (e.target.closest(".tour-play") || e.target.closest("a") || e.target.closest(".psrc")) return;
        if (tmedia.classList.contains("playing")) return;
        var ps = pickSource(c);
        if (ps === "search") { window.open(fallbackUrl(c, region), "_blank"); return; }
        playTour(ps);
      });
      card.querySelectorAll(".psrc").forEach(function (b) {
        b.addEventListener("click", function () { playTour(b.getAttribute("data-p")); });
      });
    }
    return card;
  }
  (D.CONCERTS || []).forEach(function (c, ci) { concertCards.appendChild(makeConcertCard(c, ci)); });
  // auto-scrolling poster bands for visual impact
  function buildBand(id) {
    var host = document.getElementById(id);
    if (!host || !D.ALBUMS || !D.ALBUMS.length) return;
    var pb = document.createElement("div");
    pb.className = "pb";
    var imgs = [];
    D.ALBUMS.concat(D.ALBUMS).forEach(function (a) {
      imgs.push('<img src="' + a.poster + '" alt="' + a.title + ' · 海报" loading="lazy" />');
    });
    pb.innerHTML = imgs.join("");
    host.appendChild(pb);
  }
  buildBand("live-band");
  buildBand("more-band");

  // 颁奖现场（影响与荣誉）：点击 → 弹出大窗口播放（点击外部/空白收起）
  var awardClips = document.getElementById("award-clips");
  if (awardClips && D.AWARDS) {
    D.AWARDS.forEach(function (a, ai) {
      var c = makeLiveCard(a, true);
      stagger(c, ai);
      awardClips.appendChild(c);
    });
  }
  // stagger static card groups
  document.querySelectorAll(".legacy .card").forEach(function (el, i) { stagger(el, i); });
  document.querySelectorAll(".quotes blockquote").forEach(function (el, i) { stagger(el, i); });
  document.querySelectorAll(".extra-grid .extra").forEach(function (el, i) { stagger(el, i); });

  // 现场与历史影像图集：点击卡片直接在新标签打开大图/来源（不做站内弹层）
  var liveGallery = document.getElementById("live-gallery");
  if (liveGallery && D.GALLERY) {
    D.GALLERY.forEach(function (g, gi) {
      var a = document.createElement("a");
      a.className = "g-item";
      // music.apple.com 只是站头没有内容，退回直接打开图片；其余开来源页
      a.href = (g.src && g.src.indexOf("music.apple.com") === -1) ? g.src : g.img;
      a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--d", Math.min(gi * 60, 300) + "ms");
      a.innerHTML = '<img src="' + g.img + '" alt="' + g.title + ' · 影像来源 Wikimedia Commons" loading="lazy" />' +
        '<span class="g-cap"><strong>' + g.title + '</strong><small>' + g.sub + '</small></span>';
      liveGallery.appendChild(a);
    });
  }

  /* ============================================================
     经典时刻 · BIG PLAY
     ============================================================ */
  var MOMENTS = D.MOMENTS || [];
  var mStage = document.getElementById("moment-stage");
  if (mStage && MOMENTS.length) {
    var mFrame = document.getElementById("moment-frame");
    var mPlayBtn = document.getElementById("moment-play");
    var mPrevBtn = document.getElementById("moment-prev");
    var mNextBtn = document.getElementById("moment-next");
    var mTitle = document.getElementById("moment-title");
    var mSub = document.getElementById("moment-sub");
    var mIdx = document.getElementById("moment-idx");
    var mVei = document.getElementById("moment-veil");
    var mVeiImg = document.getElementById("moment-veil-img");
    var mVeiTxt = document.getElementById("moment-veil-txt");
    var mTools = document.getElementById("moment-tools");
    var mExt = document.getElementById("moment-ext");
    var mtBtns = mTools ? Array.prototype.slice.call(mTools.querySelectorAll(".mt-chip")) : [];
    var mi2 = 0, mOn = false, mPlat = "", veilTimer = null;
    function mSrcFor(m, plat) {
      plat = plat || (region === "cn" ? (m.bv ? "bv" : "yt") : (m.yt ? "yt" : "bv"));
      if (plat === "bv" && m.bv) return "https://player.bilibili.com/player.html?isOutside=true&bvid=" + m.bv + "&autoplay=1&danmaku=0&high_quality=1";
      if (plat === "yt" && m.yt) return "https://www.youtube.com/embed/" + m.yt + "?rel=0&autoplay=1";
      return "";
    }
    function mOpenUrl(m) {
      var plat = mPlat || (region === "cn" ? (m.bv ? "bv" : "yt") : (m.yt ? "yt" : "bv"));
      if (plat === "bv" && m.bv) return "https://www.bilibili.com/video/" + m.bv;
      if (plat === "yt" && m.yt) return "https://www.youtube.com/watch?v=" + m.yt;
      if (m.bv) return "https://www.bilibili.com/video/" + m.bv;
      if (m.yt) return "https://www.youtube.com/watch?v=" + m.yt;
      return "https://search.bilibili.com/all?keyword=" + encodeURIComponent(m.title);
    }
    function showVeil(t) {
      if (!mVei) return;
      if (mVeiImg && t) mVeiImg.src = t;
      if (mVeiTxt) mVeiTxt.textContent = "正在连接播放器…";
      mVei.classList.add("show");
    }
    function hideVeil() {
      if (veilTimer) { clearTimeout(veilTimer); veilTimer = null; }
      if (mVei) mVei.classList.remove("show");
    }
    function renderM(play, platOverride) {
      var m = MOMENTS[mi2];
      var mBg = document.getElementById("moment-bg");
      var mPoster = document.getElementById("moment-poster");
      if (mBg) mBg.style.backgroundImage = "url('" + m.poster + "')";
      if (mPoster) mPoster.src = THUMBS[m.bv] || m.poster;
      mTitle.textContent = m.title;
      var curPlat = platOverride || mPlat || (region === "cn" ? (m.bv ? "bv" : "yt") : (m.yt ? "yt" : "bv"));
      mSub.textContent = m.sub + " · " + (curPlat === "bv" ? "B站源" : "YouTube 源");
      mIdx.textContent = (mi2 + 1) + " / " + MOMENTS.length;
      if (mtBtns) mtBtns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-mt") === curPlat); });
      if (mExt) mExt.href = mOpenUrl(m);
      if (play) {
        var src = mSrcFor(m, platOverride || mPlat);
        if (!src) {
          // 当前地区无可用源：回到预览并给出外部打开
          stopActiveFrame();
          mFrame.innerHTML = "";
          mStage.classList.remove("live");
          mOn = false;
          hideVeil();
          if (mSub) mSub.textContent = m.sub + " · 该地区暂无此源，请用「外部打开 ↗」";
          return;
        }
        stopActiveFrame(); // 互斥：大屏开播先停掉任意卡片在播视频
        var ifr = document.createElement("iframe");
        ifr.setAttribute("src", src);
        ifr.setAttribute("title", m.title);
        ifr.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture");
        ifr.setAttribute("allowfullscreen", "true");
        mFrame.innerHTML = "";
        mFrame.appendChild(ifr);
        mStage.classList.add("live");
        mOn = true;
        showVeil(m.poster);
        ifr.addEventListener("load", function () { hideVeil(); }, false);
        // 兜底：一段时间仍未就绪就收起遮罩，避免遮挡交互（工具条在下方可换源/外开）
        if (veilTimer) clearTimeout(veilTimer);
        veilTimer = setTimeout(function () {
          if (mVeiTxt) mVeiTxt.textContent = "画面仍在加载？请点下方「B站 / YouTube」换源，或「外部打开 ↗」";
          if (mVei) mVei.classList.add("linger");
        }, 6500);
      } else {
        hideVeil();
        mFrame.innerHTML = "";
        mStage.classList.remove("live");
        mOn = false;
      }
    }
    // 注册给 stopActiveFrame：卡片视频开播时自动停掉大屏（互斥）
    momentStopFn = function () { if (mOn) renderM(false); };
    mPlayBtn.addEventListener("click", function () { renderM(!mOn); });
    mPrevBtn.addEventListener("click", function () { mi2 = (mi2 - 1 + MOMENTS.length) % MOMENTS.length; renderM(mOn, mPlat || undefined); });
    mNextBtn.addEventListener("click", function () { mi2 = (mi2 + 1) % MOMENTS.length; renderM(mOn, mPlat || undefined); });
    mtBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        mPlat = b.getAttribute("data-mt");
        var src = mSrcFor(MOMENTS[mi2], mPlat);
        if (!src) {
          if (mExt) window.open(mOpenUrl(MOMENTS[mi2]), "_blank");
          return;
        }
        renderM(true, mPlat);
        mStage.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    renderM(false);
    // 名场面选择条：先预览（封面 + 信息），点中央 ▶ 播放
    var mPick = document.getElementById("moment-pick");
    if (mPick) {
      MOMENTS.forEach(function (m, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "mpick";
        var vth = THUMBS[m.bv] || (m.yt ? 'https://i.ytimg.com/vi/' + m.yt + '/hqdefault.jpg' : m.poster);
        b.innerHTML = '<img src="' + vth + '" alt="' + m.title + ' · 预览" loading="lazy" onerror="this.src=\'' + m.poster + '\'" />' +
          '<span class="mp-play">▶</span><span class="mp-cap">' + m.title + "</span>";
        b.addEventListener("click", function () {
          mi2 = i;
          mPlat = ""; // 换片后按地区自动选择
          renderM(true);
          mStage.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        mPick.appendChild(b);
      });
    }
    // 地区切换时若正在播放则用新源重放
    var prevReg = window.__mjOnRegion;
    window.__mjOnRegion = function () {
      if (typeof prevReg === "function") prevReg();
      if (mStage && mOn) renderM(true, mPlat || undefined);
    };
  }

  /* ============================================================
     IN MEMORIAM · 怀念蜡烛
     ============================================================ */
  var CANDLE_MAX = 20;
  var memorialSec = document.getElementById("memorial");
  var candleRow = document.getElementById("candle-row");
  var candleCountEl = document.getElementById("candle-count");
  var candleNamesEl = document.getElementById("candle-names");
  var candleBtn = document.getElementById("candle-btn");
  var flowerBtn = document.getElementById("flower-btn");
  var flowerGarden = document.getElementById("flower-garden");
  var candleNameEl = document.getElementById("candle-name");
  var candlesLit = 0, flowerCount = 0, candleNamesList = [];
  try { candlesLit = parseInt(localStorage.getItem("by-candles") || "0", 10) || 0; } catch (e) {}
  try { flowerCount = parseInt(localStorage.getItem("by-flowers") || "0", 10) || 0; } catch (e) {}
  try { candleNamesList = JSON.parse(localStorage.getItem("by-candle-names") || "[]") || []; } catch (e) {}
  var FLOWERS = ["🌸", "🌹", "🌷", "🌺", "💐", "🌻"];
  function candleSVG() {
    return '<svg class="candle" viewBox="0 0 24 54">' +
      '<rect x="6" y="24" width="12" height="26" rx="2.5" fill="#f2e3c2"/>' +
      '<rect x="6" y="24" width="12" height="6" rx="2" fill="#e6d3aa"/>' +
      '<line x1="12" y1="24" x2="12" y2="20" stroke="#8a6a34" stroke-width="1.6"/>' +
      '<path class="flame" d="M12 6 C14.4 9.5 15.4 11.5 15.4 14.6 A3.4 3.4 0 0 1 8.6 14.6 C8.6 11.5 9.6 9.5 12 6 Z" fill="#ffb54a"/>' +
      '<path class="flame-in" d="M12 9.6 C13.1 12 13.6 13.4 13.6 14.8 A1.6 1.6 0 0 1 10.4 14.8 C10.4 13.4 10.9 12 12 9.6 Z" fill="#fff2c8"/>' +
      '</svg>';
  }

  function refreshGardenCount() {
    var gc = document.getElementById("garden-count");
    if (gc) {
      gc.innerHTML = flowerCount ? "已献上 <strong>" + flowerCount + "</strong> 朵花 · 谢谢你的挂念 ♥" : "还没有花——轻轻点一下花园就好 🌱";
    }
  }
  function gentleCount() {
    if (candlesLit || flowerCount) return "已点亮 <strong>" + candlesLit + "</strong> 支蜡烛 · 已献上 <strong>" + flowerCount + "</strong> 朵花 · 谢谢你的挂念 ♥";
    return "还没有烛光与花朵——不急，想点就点。";
  }
  function renderCandles() {
    candleRow.innerHTML = "";
    for (var i = 0; i < CANDLE_MAX; i++) {
      var wrap = document.createElement("div");
      wrap.className = "candle-wrap";
      wrap.innerHTML = candleSVG();
      if (i < candlesLit) wrap.querySelector("svg").classList.add("lit");
      candleRow.appendChild(wrap);
    }
    if (candleCountEl) candleCountEl.innerHTML = gentleCount();
  }
  function renderNames() {
    if (!candleNamesEl) return;
    candleNamesEl.innerHTML = "";
    candleNamesList.slice(-40).forEach(function (n) {
      var li = document.createElement("li");
      li.innerHTML = "<strong>" + String(n).replace(/[<>&"]/g, "") + "</strong> · 想他时，来过";
      candleNamesEl.appendChild(li);
    });
  }
  function collectName() {
    var name = (candleNameEl.value || "").trim();
    if (name) {
      candleNamesList.push(name); candleNameEl.value = "";
      try { localStorage.setItem("by-candle-names", JSON.stringify(candleNamesList)); } catch (e) {}
      renderNames();
    }
  }
  function softPop(targetEl) {
    if (!targetEl || reduced) return;
    var r = targetEl.getBoundingClientRect();
    for (var k = 0; k < 6; k++) {
      var s = document.createElement("span");
      s.className = "spark"; s.textContent = "✦";
      s.style.left = (r.left + Math.random() * r.width) + "px";
      s.style.top = (r.top + Math.random() * r.height) + "px";
      s.style.color = "#e8b27a";
      document.body.appendChild(s);
      (function (el) { setTimeout(function () { el.remove(); }, 1000); })(s);
    }
  }
  function lightCandle() {
    collectName();
    candlesLit += 1;
    try { localStorage.setItem("by-candles", String(candlesLit)); } catch (e) {}
    renderCandles();
    softPop(document.querySelector(".candle-stage"));
  }
  function addFlower() {
    collectName();
    flowerCount += 1;
    try { localStorage.setItem("by-flowers", String(flowerCount)); } catch (e) {}
    if (flowerGarden) {
      var hint = flowerGarden.querySelector(".garden-hint");
      if (hint) hint.style.display = "none";
      var f = document.createElement("span");
      f.className = "flower";
      f.textContent = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
      f.style.left = (8 + Math.random() * 82) + "%";
      f.style.top = (10 + Math.random() * 70) + "%";
      flowerGarden.appendChild(f);
    }
    if (candleCountEl) candleCountEl.innerHTML = gentleCount();
    refreshGardenCount();
    softPop(document.querySelector(".flower-garden"));
  }
  if (candleBtn) candleBtn.addEventListener("click", lightCandle);
  if (flowerBtn) flowerBtn.addEventListener("click", addFlower);
  if (flowerGarden) flowerGarden.addEventListener("click", addFlower);
  if (candleNameEl) candleNameEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (memorialSec && memorialSec.dataset.act === "flower") addFlower(); else lightCandle();
    }
  });
  // 蜡烛 / 献花 二选一
  document.querySelectorAll("#memorial .act").forEach(function (b) {
    b.addEventListener("click", function () {
      var act = b.getAttribute("data-act");
      if (memorialSec) memorialSec.dataset.act = act;
      document.querySelectorAll("#memorial .act").forEach(function (x) { x.classList.toggle("active", x === b); });
    });
  });
  renderCandles();
  renderNames();
  refreshGardenCount();

  /* ============================================================
     页面顶部 · 访问计数（今日 / 累计，CountAPI 聚合，失败回退本机）
     ============================================================ */
  (function topCounters() {
    var todayEl = document.getElementById("v-today");
    var totalEl = document.getElementById("v-total");
    if (!todayEl || !totalEl) return;
    function jget(url, ms) {
      return new Promise(function (res, rej) {
        if (typeof fetch !== "function") return rej(new Error("no-fetch"));
        var c = typeof AbortController !== "undefined" ? new AbortController() : null;
        var t = setTimeout(function () { if (c) c.abort(); rej(new Error("timeout")); }, ms || 6000);
        fetch(url, c ? { signal: c.signal } : {}).then(function (r) {
          clearTimeout(t);
          if (!r.ok) return rej(new Error("http" + r.status));
          r.json().then(res, rej);
        }, function (e) { clearTimeout(t); rej(e); });
      });
    }
    function num(el, v) { if (el) el.textContent = v == null ? "—" : String(v); }
    var today = new Date();
    var ds = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    try {
      var lt = (parseInt(localStorage.getItem("by-local-total") || "0", 10) || 0) + 1;
      localStorage.setItem("by-local-total", String(lt));
      num(totalEl, lt);
    } catch (e) { num(totalEl, "—"); }
    try {
      var ds2 = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      if (localStorage.getItem("by-local-day") !== ds2) {
        localStorage.setItem("by-local-total-day", String((parseInt(localStorage.getItem("by-local-total-day") || "0", 10) || 0) + 1));
        localStorage.setItem("by-local-day", ds2);
      }
      num(todayEl, localStorage.getItem("by-local-total-day") || 1);
    } catch (e) { num(todayEl, "—"); }
  })();

  /* ============================================================
     底部世界地图（本地 assets 同源渲染，无需外链图库）
     ============================================================ */


  /* ============================================================
     ambient audio（原创 WebAudio）
     ============================================================ */
  var soundBtn = document.querySelector(".sound-toggle");
  var actx = null, master = null, nodes = [];
  function buildPad() {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain(); master.gain.value = 0;
    var lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420; lp.Q.value = 0.6;
    lp.connect(master); master.connect(actx.destination);
    [55, 55.7, 82.4, 110.2].forEach(function (f, i) {
      var osc = actx.createOscillator(); osc.type = i % 2 ? "sine" : "triangle"; osc.frequency.value = f;
      var g = actx.createGain(); g.gain.value = i === 3 ? 0.05 : 0.12;
      osc.connect(g); g.connect(lp); osc.start(); nodes.push(osc);
    });
    var lfo = actx.createOscillator(); lfo.frequency.value = 0.08;
    var lfoG = actx.createGain(); lfoG.gain.value = 0.03;
    lfo.connect(lfoG); lfoG.connect(master.gain); lfo.start(); nodes.push(lfo);
    (function chime() {
      if (!actx) return;
      var t = actx.currentTime + 0.05;
      var o = actx.createOscillator(); var g = actx.createGain();
      o.type = "sine"; o.frequency.value = 880 + Math.random() * 400;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 2.4);
      setTimeout(chime, 5000 + Math.random() * 9000);
    })();
  }
  var playing = false;
  if (soundBtn) soundBtn.addEventListener("click", function () {
    if (reduced) return;
    if (!actx) buildPad();
    if (actx.state === "suspended") actx.resume();
    playing = !playing;
    soundBtn.classList.toggle("playing", playing);
    soundBtn.setAttribute("aria-label", playing ? "关闭环境音" : "播放环境音");
    var now = actx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(playing ? 0.14 : 0.0001, now + 1.2);
  });

  /* ============================================================
     经典现场回放 · 大窗口（点卡片弹出；点外部/✕/⏸/Esc 收起）
     ============================================================ */
  var rmEl = document.getElementById("replay-modal");
  if (rmEl) {
    var rmTitle = document.getElementById("rm-title");
    var rmSub = document.getElementById("rm-sub");
    var rmStage = document.getElementById("rm-stage");
    var rmExt = document.getElementById("rm-ext");
    var rmClose = document.getElementById("rm-close");
    var rmPause = document.getElementById("rm-pause");
    var rmSrcBtns = Array.prototype.slice.call(rmEl.querySelectorAll(".rm-src"));
    var rmCur = null, rmPlat = "";
    function rmSrc(v, plat) {
      return iframeSrcFor(v, plat);
    }
    function showRm(play, plat) {
      var src = rmSrc(play, plat);
      if (!src) { window.open(fallbackUrl(play, region), "_blank"); return; }
      rmStage.innerHTML = '<div class="rm-loading">正在连接播放器…</div>';
      var f = document.createElement("iframe");
      f.setAttribute("src", src);
      f.setAttribute("title", play.title);
      f.setAttribute("allow", "autoplay; fullscreen; encrypted-media; picture-in-picture");
      f.setAttribute("allowfullscreen", "true");
      f.addEventListener("load", function () {
        var ld = rmStage.querySelector(".rm-loading");
        if (ld) ld.style.display = "none";
      }, false);
      rmStage.appendChild(f);
      rmTitle.textContent = play.title;
      rmSub.textContent = play.year + " · " + (plat === "bv" ? "B站源" : "YouTube 源");
      rmExt.href = fallbackUrl(play, region);
      rmSrcBtns.forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-mt") === plat); });
      rmEl.classList.add("on");
      rmEl.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }
    function openReplay(v, plat) {
      if (!rmEl || !v) return;
      stopActiveFrame(); // 互斥：先停卡片/大屏/背景音乐；同时会收起已打开的窗口
      rmCur = v; rmPlat = plat || pickSource(v);
      if (rmPlat === "search") { window.open(fallbackUrl(v, region), "_blank"); return; }
      showRm(v, rmPlat);
    }
    function closeReplay() {
      if (!rmEl.classList.contains("on")) return;
      rmEl.classList.remove("on");
      rmEl.setAttribute("aria-hidden", "true");
      rmStage.innerHTML = "";
      rmCur = null;
      document.body.style.overflow = "";
    }
    // 注册进全局互斥：开播其它任何视频时，自动收起大窗口
    replayStopFn = closeReplay;
    rmClose.addEventListener("click", closeReplay);
    rmPause.addEventListener("click", closeReplay);
    rmEl.addEventListener("click", function (e) { if (e.target === rmEl) closeReplay(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeReplay(); });
    // 窗口内换源
    rmSrcBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-mt");
        if (!rmCur) return;
        var src = rmSrc(rmCur, p);
        if (!src) { window.open(fallbackUrl(rmCur, region), "_blank"); return; }
        rmPlat = p; showRm(rmCur, p);
      });
    });
    // 地区切换时，若窗口开着则用新源重放
    var rmPrevReg = window.__mjOnRegion;
    window.__mjOnRegion = function () {
      if (typeof rmPrevReg === "function") rmPrevReg();
      if (rmCur && rmEl.classList.contains("on")) {
        var p2 = region === "cn" ? (rmCur.bv ? "bv" : "yt") : (rmCur.yt ? "yt" : "bv");
        rmPlat = p2; showRm(rmCur, p2);
      }
    };
  }
  /* ---------- 乐队成员档案 ---------- */
  (function renderMembers() {
    var grid = document.getElementById("members-grid");
    if (!grid) return;
    (D.MEMBERS || []).forEach(function (m, i) {
      var card = document.createElement("article");
      card.className = "member-card" + (m.lead ? " lead" : "");
      stagger(card, i);
      card.innerHTML =
        (m.img
          ? '<div class="m-photo"><img src="' + m.img + '" alt="' + m.name + ' · 真实照片" loading="lazy" /></div>'
          : '<div class="m-photo m-initials"><span>' + m.name.charAt(0) + "</span></div>") +
        '<div class="m-body">' +
          '<span class="m-en">' + (m.en || "") + "</span>" +
          "<h3>" + m.name + "</h3>" +
          '<p class="m-role">' + m.role + "</p>" +
          (m.life ? '<p class="m-life">' + m.life + "</p>" : "") +
          '<p class="m-years">在队 ' + m.years + "</p>" +
          '<p class="m-desc">' + m.desc + "</p>" +
        "</div>";
      grid.appendChild(card);
    });
  })();

  /* ============================================================
     关系图谱 · 动态力导向图（人物 / 乐队 / 专辑 / 歌曲 / 影视）
     ============================================================ */
  (function relationGraph() {
    var svg = document.getElementById("relation-graph");
    if (!svg) return;
    var G = D.GRAPH;
    if (!G || !G.nodes || !G.nodes.length) return;
    var NS = "http://www.w3.org/2000/svg";
    var COLORS = { person: "#e9c86b", band: "#d9534f", album: "#5b8def", song: "#4caf7d", film: "#b07cf5", tv: "#d98cf0", role: "#8a94a6", platform: "#7fc8d6", award: "#f0a85b" };
    var TYPE_CN = { person: "人物", band: "乐队", album: "专辑", song: "歌曲", film: "电影", tv: "电视", role: "角色", platform: "平台", award: "奖项" };

    var PHOTO = { koma: "assets/photos/wongkakui.jpg", paul: "assets/photos/wongkoonchung.jpg", steve: "assets/photos/wongkakeung.jpg", wing: "assets/photos/yipsaiwing.jpg", lau_chiyuen: "assets/photos/lau_chiyuen.jpg", tang_william: "assets/photos/tang_waihim.jpg", beyond: "assets/photos/band.jpg" };
    function initialAvatar(name) {
      var ch = (name || "?").replace(/[《》]/g, "").slice(0, 1);
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#3a3320"/><stop offset="1" stop-color="#15151c"/></linearGradient></defs>' +
        '<rect width="120" height="120" fill="url(#g)"/>' +
        '<circle cx="60" cy="46" r="21" fill="#8b7a45"/>' +
        '<path d="M18 112c6-24 22-34 42-34s36 10 42 34z" fill="#8b7a45"/>' +
        '<text x="60" y="76" text-anchor="middle" font-size="34" font-family="PingFang SC, Microsoft YaHei, sans-serif" fill="#f4e7c3">' + ch + '</text></svg>';
      return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    }
    var nodes = G.nodes.map(function (n) { return { id: n.id, label: n.label, type: n.type, lead: !!n.lead, x: 0, y: 0, vx: 0, vy: 0, photo: PHOTO[n.id] || (n.type === "person" ? initialAvatar(n.label) : ""), r: n.type === "band" ? 40 : n.type === "person" ? (PHOTO[n.id] ? 30 : 24) : n.type === "film" || n.type === "tv" ? 18 : n.type === "role" ? 11 : n.type === "award" ? 12 : n.type === "platform" ? 13 : 14 }; });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var links = (G.links || []).filter(function (l) { return byId[l.s] && byId[l.t]; }).map(function (l) { return { s: byId[l.s], t: byId[l.t], type: l.type, note: l.note }; });

    var W = Math.max(320, svg.clientWidth || 960);
    var H = Math.max(320, svg.clientHeight || 560);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    // 分层初始布局：乐队居中、人物环绕、专辑中环、歌曲/影视外环
    (function initLayout() {
      var rings = { band: 0, person: 150, album: 235, song: 300, film: 330, tv: 345, role: 365, award: 345, platform: 380 };
      var counters = {};
      nodes.forEach(function (n) {
        var ring = rings[n.type] || 260;
        counters[n.type] = (counters[n.type] || 0) + 1;
        var total = nodes.filter(function (m) { return m.type === n.type; }).length;
        var idx = counters[n.type] - 1;
        var ang = (idx / Math.max(total, 1)) * Math.PI * 2 + (n.type === "song" ? 0.35 : 0);
        n.x = W / 2 + Math.cos(ang) * ring;
        n.y = H / 2 + Math.sin(ang) * ring * 0.78;
      });
    })();

    var defs = document.createElementNS(NS, "defs");
    svg.appendChild(defs);
    var gLinks = document.createElementNS(NS, "g");
    var gNodes = document.createElementNS(NS, "g");
    svg.appendChild(gLinks); svg.appendChild(gNodes);

    var linkEls = links.map(function (l) {
      var line = document.createElementNS(NS, "line");
      line.setAttribute("stroke", "rgba(190,190,210,.25)");
      line.setAttribute("stroke-width", l.type === "所属" || l.type === "专辑" ? 1.6 : 1);
      line.setAttribute("stroke-dasharray", l.type === "主题曲" ? "4 4" : "");
      gLinks.appendChild(line);
      return line;
    });

    var nodeEls = nodes.map(function (n) {
      var g = document.createElementNS(NS, "g");
      g.setAttribute("class", "rg-node");
      if (n.lead) g.setAttribute("class", "rg-node lead");
      var halo = document.createElementNS(NS, "circle");
      halo.setAttribute("r", n.r + 5);
      halo.setAttribute("fill", "none");
      halo.setAttribute("stroke", "transparent");
      halo.setAttribute("class", "rg-halo");
      var c;
      if (n.photo) {
        var cp = document.createElementNS(NS, "clipPath");
        cp.setAttribute("id", "rgclip-" + n.id);
        var cpc = document.createElementNS(NS, "circle");
        cpc.setAttribute("r", n.r);
        cp.appendChild(cpc); defs.appendChild(cp);
        c = document.createElementNS(NS, "image");
        c.setAttribute("href", n.photo);
        c.setAttribute("x", -n.r); c.setAttribute("y", -n.r);
        c.setAttribute("width", n.r * 2); c.setAttribute("height", n.r * 2);
        c.setAttribute("preserveAspectRatio", "xMidYMid slice");
        c.setAttribute("clip-path", "url(#rgclip-" + n.id + ")");
        c.setAttribute("class", "rg-photo");
        var ring = document.createElementNS(NS, "circle");
        ring.setAttribute("r", n.r);
        ring.setAttribute("fill", "none");
        ring.setAttribute("stroke", COLORS[n.type]);
        ring.setAttribute("stroke-width", n.lead ? "3" : "2");
        ring.setAttribute("class", "rg-ring");
        g.appendChild(ring);
      } else {
        c = document.createElementNS(NS, "circle");
        c.setAttribute("r", n.r);
        c.setAttribute("fill", COLORS[n.type] || "#888");
        c.setAttribute("fill-opacity", n.lead ? "1" : ".85");
        c.setAttribute("class", "rg-dot");
      }
      var t = document.createElementNS(NS, "text");
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("y", n.r + 17);
      t.setAttribute("fill", "rgba(232,232,240,.82)");
      t.setAttribute("font-size", n.type === "band" ? "14" : "11");
      t.setAttribute("letter-spacing", ".5");
      t.setAttribute("class", "rg-label");
      t.textContent = n.label;
      n.labelEl = t;
      if (["role", "award", "platform"].indexOf(n.type) !== -1) t.setAttribute("opacity", "0");
      g.appendChild(halo); g.appendChild(c); g.appendChild(t);
      g.appendChild(titleEl(n.label));
      gNodes.appendChild(g);
      return g;
    });
    function titleEl(txt) { var t = document.createElementNS(NS, "title"); t.textContent = txt; return t; }

    // 交互：拖拽 / 悬停高亮 / 点击面板
    var drag = null, hoverNode = null, activeType = "all";
    var panel = document.getElementById("graph-panel");
    function relatedOf(n) {
      return links.filter(function (l) { return l.s === n || l.t === n; });
    }
    function showPanel(n) {
      if (!panel) return;
      var rel = relatedOf(n);
      var html = '<span class="gp-type">' + (TYPE_CN[n.type] || "节点") + '</span><h4>' + n.label + "</h4>";
      if (!rel.length) html += "<p>暂无已收录的关系。</p>";
      else {
        html += "<ul>";
        rel.slice(0, 12).forEach(function (l) {
          var other = l.s === n ? l.t : l.s;
          var arrow = l.s === n ? " → " : " ← ";
          html += "<li>" + (l.s === n ? "与 " : "被 ") + other.label + arrow + l.type + "</li>";
        });
        html += "</ul>";
      }
      panel.innerHTML = html;
      panel.classList.add("on");
    }
    function clearPanel() { if (panel) panel.classList.remove("on"); }

    nodeEls.forEach(function (g, i) {
      var n = nodes[i];
      g.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        var r = svg.getBoundingClientRect();
        drag = { n: n, dx: e.clientX - r.left - n.x, dy: e.clientY - r.top - n.y };
        svg.classList.add("dragging");
        try { g.setPointerCapture(e.pointerId); } catch (err) {}
      });
      g.addEventListener("pointerenter", function () { hoverNode = n; highlight(n); });
      g.addEventListener("pointerleave", function () { hoverNode = null; highlight(null); });
      g.addEventListener("click", function (e) { e.stopPropagation(); showPanel(n); });
    });
    svg.addEventListener("pointermove", function (e) {
      if (!drag) return;
      var r = svg.getBoundingClientRect();
      drag.n.x = Math.max(20, Math.min(W - 20, e.clientX - r.left - drag.dx));
      drag.n.y = Math.max(20, Math.min(H - 20, e.clientY - r.top - drag.dy));
      drag.n.vx = 0; drag.n.vy = 0;
    });
    window.addEventListener("pointerup", function () { drag = null; svg.classList.remove("dragging"); });
    svg.addEventListener("click", function () { clearPanel(); });

    function highlight(n) {
      var set = {};
      if (n) { set[n.id] = true; relatedOf(n).forEach(function (l) { set[l.s.id] = true; set[l.t.id] = true; }); }
      nodes.forEach(function (m, i) {
        var on = !n || set[m.id];
        nodeEls[i].style.opacity = on ? "1" : ".22";
        var label = nodeEls[i].querySelector(".rg-label");
        if (label) {
          var def = ["role", "award", "platform"].indexOf(m.type) === -1;
          label.setAttribute("opacity", def || (n && set[m.id]) ? "1" : "0");
        }
      });
      linkEls.forEach(function (el, i) {
        var l = links[i];
        var on = !n || l.s === n || l.t === n;
        el.setAttribute("stroke", on && n ? "rgba(233,200,107,.75)" : "rgba(190,190,210,.22)");
      });
    }

    // 筛选
    var GROUPS = { work: ["album", "song"], screen: ["film", "tv"], honor: ["award", "platform"] };
    function typeInGroup(t, g) {
      if (g === "all") return true;
      if (GROUPS[g]) return GROUPS[g].indexOf(t) !== -1;
      return t === g;
    }
    var chips = document.querySelectorAll(".gt-chip");
    chips.forEach(function (b) {
      b.addEventListener("click", function () {
        chips.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        activeType = b.getAttribute("data-gtype");
        nodes.forEach(function (m, i) {
          var ok = typeInGroup(m.type, activeType);
          nodeEls[i].style.opacity = ok ? "1" : ".15";
        });
        linkEls.forEach(function (el, i) {
          var l = links[i];
          var ok = typeInGroup(l.s.type, activeType) || typeInGroup(l.t.type, activeType);
          el.style.opacity = ok ? "1" : ".08";
        });
      });
    });

    // 力导向模拟（轻量、无外部依赖）
    var alpha = 1;
    function tick() {
      alpha *= 0.985;
      if (alpha < 0.05) alpha = 0.05;
      var i, j, a, b, dx, dy, d, f;
      // 斥力
      for (i = 0; i < nodes.length; i++) {
        a = nodes[i];
        for (j = i + 1; j < nodes.length; j++) {
          b = nodes[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy) || 1;
          f = 5200 / (d * d);
          if (f > 6) f = 6;
          a.vx += (dx / d) * f; a.vy += (dy / d) * f;
          b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
        }
      }
      // 弹簧
      links.forEach(function (l) {
        dx = l.t.x - l.s.x; dy = l.t.y - l.s.y;
        d = Math.sqrt(dx * dx + dy * dy) || 1;
        var target = l.s.r + l.t.r + 100;
        f = (d - target) * 0.012;
        l.s.vx += (dx / d) * f; l.s.vy += (dy / d) * f;
        l.t.vx -= (dx / d) * f; l.t.vy -= (dy / d) * f;
      });
      // 向心力 + 阻尼
      nodes.forEach(function (n) {
        n.vx += (W / 2 - n.x) * 0.0016;
        n.vy += (H / 2 - n.y) * 0.0016;
        if (!drag || drag.n !== n) {
          n.vx *= 0.86; n.vy *= 0.86;
          n.x += n.vx * alpha * 18;
          n.y += n.vy * alpha * 18;
          n.x = Math.max(26, Math.min(W - 26, n.x));
          n.y = Math.max(26, Math.min(H - 26, n.y));
        }
      });
      linkEls.forEach(function (el, i) {
        var l = links[i];
        el.setAttribute("x1", l.s.x); el.setAttribute("y1", l.s.y);
        el.setAttribute("x2", l.t.x); el.setAttribute("y2", l.t.y);
      });
      nodes.forEach(function (n, i) {
        nodeEls[i].setAttribute("transform", "translate(" + n.x.toFixed(2) + "," + n.y.toFixed(2) + ")");
        if (n.labelEl) {
          var ang = Math.atan2(n.y - H / 2, n.x - W / 2);
          var lr = n.r + 13;
          var lx = Math.cos(ang) * lr, ly = Math.sin(ang) * lr + 4;
          var ca = Math.cos(ang);
          n.labelEl.setAttribute("x", lx.toFixed(1));
          n.labelEl.setAttribute("y", ly.toFixed(1));
          n.labelEl.setAttribute("text-anchor", ca > 0.2 ? "start" : ca < -0.2 ? "end" : "middle");
        }
      });
      requestAnimationFrame(tick);
    }
    tick();
  })();

  /* ---------- 影像足迹（电影 / 电视 / 综艺） ---------- */
  (function renderScreen() {
    var grid = document.getElementById("screen-grid");
    if (!grid) return;
    (D.SCREEN || []).forEach(function (s, i) {
      var card = document.createElement("article");
      card.className = "screen-card";
      stagger(card, i);
      var kw = encodeURIComponent(s.kw || s.title);
      card.innerHTML =
        '<div class="sc-media"><img src="' + (THUMBS[s.bv] || s.img) + '" alt="' + s.title + '" loading="lazy" />' +
          '<span class="sc-type">' + s.type + "</span></div>" +
        '<div class="sc-body">' +
          "<h3>" + s.title + "</h3>" +
          '<div class="sc-meta">' + s.year + (s.director ? " · " + s.director : "") + "</div>" +
          "<p>" + s.role + "</p>" +
          '<p style="margin-top:6px">' + s.note + "</p>" +
          '<div class="sc-links"><a href="https://search.bilibili.com/all?keyword=' + kw + '" target="_blank" rel="noopener">B站搜相关影像 ↗</a></div>' +
        "</div>";
      grid.appendChild(card);
    });
  })();


  /* ============================================================
     背景音乐 · 经典循环（隐藏播放器，B站源，与视频互斥）
     ============================================================ */



  /* ---------- 舞台瞬间（现场封面画廊） ---------- */
  (function renderStage() {
    var host = document.getElementById("stage-gallery");
    if (!host || !D.CONCERTS) return;
    var items = [];
    (D.CONCERTS || []).forEach(function (c) {
      if (c.bv) items.push({ title: c.title, sub: c.years || "现场", bv: c.bv, img: c.img });
    });
    (D.VIDEOS || []).forEach(function (v) {
      if (v.kind === "live" && v.bv) items.push({ title: v.title, sub: v.yearLabel || "现场", bv: v.bv, img: v.img });
    });
    var seen = {};
    items = items.filter(function (it) { if (seen[it.bv]) return false; seen[it.bv] = 1; return true; }).slice(0, 16);
    items.forEach(function (it, i) {
      var a = document.createElement("a");
      a.className = "g-item";
      a.href = "https://www.bilibili.com/video/" + it.bv;
      a.target = "_blank"; a.rel = "noopener";
      a.style.setProperty("--d", Math.min(i * 50, 300) + "ms");
      a.innerHTML = '<img src="' + (THUMBS[it.bv] || it.img) + '" alt="' + it.title + ' · 舞台画面" loading="lazy" />' +
        '<span class="g-cap"><strong>' + it.title + '</strong><small>' + it.sub + '</small></span>';
      host.appendChild(a);
    });
  })();


  /* ============================================================
     背景音乐 · 原创合成音轨（WebAudio 生成，无第三方版权）
     ============================================================ */



})();
