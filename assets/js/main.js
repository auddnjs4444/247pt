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
    var abs = new URL(src, window.location.href).href; // CSS 파일 기준 상대경로 오해석 방지
    var probe = new Image();
    probe.onload = function () {
      Array.prototype.forEach.call(bg.querySelectorAll('.half'), function (h) {
        h.style.setProperty('--img', 'url("' + abs + '")');
        h.classList.add('has-img');
      });
    };
    probe.src = abs;
  });

  /* ------------------------------------------------ 타이틀을 글자 단위로 분해
     (링크나 <br>이 들어간 타이틀은 그대로 두고 줄 단위 리빌로 폴백) */
  Array.prototype.forEach.call(document.querySelectorAll('.giant .w'), function (w) {
    if (w.children.length) return;
    var text = w.textContent;
    var html = '';
    for (var i = 0; i < text.length; i++) {
      var c = text.charAt(i) === ' ' ? '&nbsp;' : text.charAt(i);
      html += '<span class="ch" style="--i:' + i + '" aria-hidden="true">' + c + '</span>';
    }
    w.setAttribute('aria-label', text);
    w.innerHTML = html;
    w.classList.add('is-split');
  });

  /* ------------------------------------------------------------ 등장 애니메이션
     슬라이드에 들어올 때마다 다시 재생 (나가면 리셋) */
  var panels = document.querySelectorAll('.panel');
  var navLinks = document.querySelectorAll('.frame--top a');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-in', entry.isIntersecting);
        if (entry.isIntersecting) {
          // 현재 슬라이드에 해당하는 상단 메뉴 표시
          var id = entry.target.id;
          Array.prototype.forEach.call(navLinks, function (a) {
            a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3 });
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
