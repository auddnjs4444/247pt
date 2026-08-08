/* ==========================================================================
   247 FITNESS — main.js (포스터 슬라이드판, 의존성 없음)
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- loader */
  var loader = document.getElementById('loader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (loader) loader.classList.add('is-done');
    }, reduceMotion ? 0 : 500);
  });

  /* ------------------------------------------------------- 이미지 지연 적용
     assets/img 에 사진이 없어도 깨지지 않도록, 파일이 실제로 로드될 때만
     좌/우 반쪽 배경으로 넣는다. (왼쪽 흑백 / 오른쪽 컬러 디피티크) */
  Array.prototype.forEach.call(document.querySelectorAll('.panel__bg[data-img]'), function (bg) {
    var src = bg.getAttribute('data-img');
    if (!src) return;
    var probe = new Image();
    probe.onload = function () {
      Array.prototype.forEach.call(bg.querySelectorAll('.half'), function (h) {
        h.style.setProperty('--img', 'url("' + src + '")');
        h.classList.add('has-img');
      });
    };
    probe.src = src;
  });

  /* ------------------------------------------------------------ 등장 애니메이션 */
  var panels = document.querySelectorAll('.panel');
  var navLinks = document.querySelectorAll('.frame--top a');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          // 현재 슬라이드에 해당하는 상단 메뉴 표시
          var id = entry.target.id;
          Array.prototype.forEach.call(navLinks, function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35 });
    Array.prototype.forEach.call(panels, function (p) { io.observe(p); });
  } else {
    Array.prototype.forEach.call(panels, function (p) { p.classList.add('is-in'); });
  }

  /* ------------------------------------------------------- 앵커 부드러운 이동 */
  Array.prototype.forEach.call(document.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ------------------------------------------------------------------ 기타 */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
