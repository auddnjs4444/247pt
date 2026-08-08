/* ==========================================================================
   247 FITNESS — main.js  (의존성 없음 / vanilla)
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- loader */
  var loader = document.getElementById('loader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (loader) loader.classList.add('is-done');
      document.body.classList.add('is-ready');
      revealInView(); // 첫 화면 요소 바로 노출
    }, reduceMotion ? 0 : 700);
  });

  /* ------------------------------------------------------- 이미지 지연 적용
     assets/img 에 실제 사진이 없어도 레이아웃이 깨지지 않도록,
     파일이 실제로 로드될 때만 배경으로 넣는다. */
  function applyImages() {
    var nodes = document.querySelectorAll('[data-img]');
    Array.prototype.forEach.call(nodes, function (el) {
      var src = el.getAttribute('data-img');
      if (!src) return;
      var probe = new Image();
      probe.onload = function () {
        el.style.setProperty('--img', 'url("' + src + '")');
        el.classList.add('has-img');
      };
      probe.src = src;
    });
  }
  applyImages();

  /* ---------------------------------------------------------------- header */
  var header = document.getElementById('header');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;

    if (header) {
      header.classList.toggle('is-stuck', y > 40);
      var goingDown = y > lastY && y > 320;
      header.classList.toggle('is-hidden', goingDown && !drawerOpen);
    }

    var mcta = document.querySelector('.mcta');
    if (mcta) mcta.classList.toggle('is-show', y > 480);

    // hero parallax
    if (hero && !reduceMotion && y < window.innerHeight * 1.2) {
      hero.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0)';
    }

    lastY = y;
    ticking = false;
  }

  var hero = document.querySelector('.hero__media');
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  /* ---------------------------------------------------------------- drawer */
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');
  var drawerOpen = false;

  function setDrawer(open) {
    drawerOpen = open;
    if (!drawer || !burger) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    document.body.classList.toggle('is-locked', open);
  }

  if (burger) burger.addEventListener('click', function () { setDrawer(!drawerOpen); });
  if (drawer) {
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawerOpen) setDrawer(false);
  });

  /* ------------------------------------------------------------- 스크롤 리빌 */
  var revealTargets = document.querySelectorAll('.reveal, .sec-title, .hero__title');

  function markIn(el) {
    el.classList.add('is-in');
    Array.prototype.forEach.call(el.querySelectorAll('.line'), function (l) {
      l.classList.add('is-in');
    });
    if (el.hasAttribute('data-count') || el.querySelector('[data-count]')) countUp(el);
  }

  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            markIn(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 })
    : null;

  if (io) {
    Array.prototype.forEach.call(revealTargets, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealTargets, markIn);
  }

  function revealInView() {
    Array.prototype.forEach.call(revealTargets, function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) markIn(el);
    });
  }

  /* ---------------------------------------------------------- 숫자 카운트업 */
  function countUp(scope) {
    var el = scope.hasAttribute('data-count') ? scope : scope.querySelector('[data-count]');
    if (!el || el.dataset.counted) return;
    el.dataset.counted = '1';

    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target + suffix; return; }

    var start = null, dur = 1100;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(step);
  }

  /* ------------------------------------------------------------ 현재 메뉴 */
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav a');

  if ('IntersectionObserver' in window && navLinks.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        Array.prototype.forEach.call(navLinks, function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Array.prototype.forEach.call(sections, function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------------- 갤러리 */
  var rail = document.getElementById('gRail');
  var prev = document.getElementById('gPrev');
  var next = document.getElementById('gNext');

  function scrollRail(dir) {
    if (!rail) return;
    var item = rail.querySelector('.gitem');
    var step = item ? item.getBoundingClientRect().width + 16 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: step * dir, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  if (prev) prev.addEventListener('click', function () { scrollRail(-1); });
  if (next) next.addEventListener('click', function () { scrollRail(1); });

  // 데스크톱에서 드래그 스크롤
  if (rail) {
    var down = false, startX = 0, startScroll = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; startX = e.clientX; startScroll = rail.scrollLeft;
      rail.style.cursor = 'grabbing';
    });
    window.addEventListener('pointerup', function () {
      down = false; rail.style.cursor = '';
    });
    rail.addEventListener('pointermove', function (e) {
      if (!down) return;
      e.preventDefault();
      rail.scrollLeft = startScroll - (e.clientX - startX);
    });
  }

  /* ------------------------------------------------------- 앵커 부드러운 이동 */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - (id === '#hero' ? 0 : 64);
      window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------------------ 기타 */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  onScroll();
})();
