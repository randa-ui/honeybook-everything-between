(function () {
  document.documentElement.classList.add('js');

  /* ---- video players: click-to-play, one at a time ---- */
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (p) {
    var video = p.querySelector('video');
    video.setAttribute('tabindex', '0');
    video.setAttribute('role', 'button');
    function toggle() { if (video.paused) { video.play(); } else { video.pause(); } }
    video.addEventListener('click', toggle);
    video.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    video.addEventListener('play', function () {
      p.classList.add('is-playing');
      players.forEach(function (o) { if (o !== p) o.querySelector('video').pause(); });
    });
    video.addEventListener('pause', function () { p.classList.remove('is-playing'); });
    video.addEventListener('ended', function () { video.load(); p.classList.remove('is-playing'); });
  });

  /* ---- style frames gallery ---- */
  var stageImg = document.getElementById('stage-img');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.thumbs [role="tab"]'));
  var styleIndex = 0;
  function showStyle(i, instant) {
    styleIndex = (i + tabs.length) % tabs.length;
    var t = tabs[styleIndex];
    tabs.forEach(function (b, j) { b.setAttribute('aria-selected', j === styleIndex ? 'true' : 'false'); });
    var swap = function () {
      stageImg.src = t.getAttribute('data-src');
      stageImg.alt = t.querySelector('img').alt;
      stageImg.onload = function () { stageImg.classList.remove('fading'); };
    };
    if (instant) { swap(); return; }
    stageImg.classList.add('fading');
    setTimeout(swap, 180);
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { showStyle(i); }); });
  showStyle(0, true);

  /* ---- lightbox (shared by style frames and social) ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lb-img');
  var set = [], idx = 0, lastFocus = null;

  function openLb(items, i, trigger) {
    set = items; idx = i; lastFocus = trigger || document.activeElement;
    render();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    lb.querySelector('.lb-close').focus();
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function render() {
    var it = set[idx];
    lbImg.src = it.src; lbImg.alt = it.alt || '';
    lb.querySelector('.lb-prev').hidden = set.length < 2;
    lb.querySelector('.lb-next').hidden = set.length < 2;
  }
  function step(d) { idx = (idx + d + set.length) % set.length; render(); }

  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', function () { step(-1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  var styleItems = tabs.map(function (t) {
    return { src: t.getAttribute('data-src'), alt: t.querySelector('img').alt };
  });
  document.querySelector('.stage-btn').addEventListener('click', function (e) { openLb(styleItems, styleIndex, e.currentTarget); });

  var socialBtns = Array.prototype.slice.call(document.querySelectorAll('#social-grid button'));
  var socialItems = socialBtns.map(function (b, i) {
    return { src: b.getAttribute('data-full'), alt: b.querySelector('img').alt };
  });
  socialBtns.forEach(function (b, i) { b.addEventListener('click', function (e) { openLb(socialItems, i, e.currentTarget); }); });

  /* ---- reveal on scroll (visible at rest without JS or with reduced motion) ---- */
  var targets = document.querySelectorAll('.board li, .thumbs button, .social-grid li, .player, .stage, .sec-head');
  Array.prototype.forEach.call(targets, function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(targets, function (el) { el.classList.add('in'); });
  }
})();
