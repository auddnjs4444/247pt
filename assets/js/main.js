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
  function loadInto(src, targets) {
    if (!src || !targets.length) return;
    var abs = new URL(src, window.location.href).href; // CSS 파일 기준 상대경로 오해석 방지
    var probe = new Image();
    probe.onload = function () {
      targets.forEach(function (el) {
        el.style.setProperty('--img', 'url("' + abs + '")');
        el.classList.add('has-img');
      });
    };
    probe.src = abs;
  }

  Array.prototype.forEach.call(document.querySelectorAll('.panel__bg'), function (bg) {
    var halves = Array.prototype.slice.call(bg.querySelectorAll('.half'));
    if (bg.hasAttribute('data-img')) {
      loadInto(bg.getAttribute('data-img'), halves.concat([bg])); // 한 장을 좌우로 분할 (+뒤쪽 블러 배경용)
    } else {
      // 좌/우 서로 다른 사진 (예: 탈의실 | 샤워실)
      loadInto(bg.getAttribute('data-img-l'), halves.filter(function (h) { return h.classList.contains('half--l'); }));
      loadInto(bg.getAttribute('data-img-r'), halves.filter(function (h) { return h.classList.contains('half--r'); }));
    }
  });

  // 트레이너 프로필 사진
  Array.prototype.forEach.call(document.querySelectorAll('[data-timg]'), function (el) {
    var abs = new URL(el.getAttribute('data-timg'), window.location.href).href;
    var probe = new Image();
    probe.onload = function () { el.style.backgroundImage = 'url("' + abs + '")'; };
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

  /* =====================================================================
     그룹PT 시간표 모달
     - 첫 진입 시 자동 팝업 ('오늘 하루 보지 않기' 체크 시 24시간 미노출)
     - PT 섹션의 '그룹PT 시간표 보기' 버튼으로는 언제나 열림
     ===================================================================== */
  var modal = document.getElementById('scheduleModal');

  if (modal) {
    var modalBox = modal.querySelector('.modal__box');
    var closeBtn = document.getElementById('scheduleClose');
    var hideToday = document.getElementById('scheduleHideToday');
    var STORE_KEY = '247:schedule-hidden-until';
    var lastTrigger = null;
    var savedY = 0;
    var closeTimer = null;

    // localStorage 는 사파리 프라이빗 모드 등에서 막힐 수 있어 항상 감싼다
    function readHiddenUntil() {
      try { return parseInt(localStorage.getItem(STORE_KEY), 10) || 0; }
      catch (e) { return 0; }
    }
    function writeHiddenUntil(ts) {
      try { localStorage.setItem(STORE_KEY, String(ts)); } catch (e) {}
    }

    function focusables() {
      return Array.prototype.filter.call(
        modal.querySelectorAll('button, [href], input, [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetParent !== null || el === closeBtn; }
      );
    }

    function openModal(trigger) {
      if (!modal.hidden) return;
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }

      lastTrigger = trigger || null;
      savedY = window.scrollY;

      modal.hidden = false;
      document.documentElement.classList.add('is-modal-open');
      // hidden 해제 직후 한 프레임 뒤에 클래스를 붙여야 트랜지션이 재생된다
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { modal.classList.add('is-open'); });
      });
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      if (modal.hidden) return;

      if (hideToday && hideToday.checked) {
        writeHiddenUntil(Date.now() + 24 * 60 * 60 * 1000);
      }

      modal.classList.remove('is-open');
      document.documentElement.classList.remove('is-modal-open');

      // 스크롤 잠금 해제 시 위치가 튀지 않게 복원
      var prev = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, savedY);
      document.documentElement.style.scrollBehavior = prev;

      closeTimer = setTimeout(function () {
        modal.hidden = true;
        closeTimer = null;
      }, reduceMotion ? 0 : 280);

      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      lastTrigger = null;
    }

    Array.prototype.forEach.call(document.querySelectorAll('[data-schedule-open]'), function (btn) {
      btn.addEventListener('click', function () { openModal(btn); });
    });
    Array.prototype.forEach.call(modal.querySelectorAll('[data-schedule-close]'), function (btn) {
      btn.addEventListener('click', closeModal);
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;

      if (e.key === 'Escape') { closeModal(); return; }

      if (e.key === 'Tab') { // 포커스 트랩
        var items = focusables();
        if (!items.length) return;
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        } else if (!modalBox.contains(document.activeElement)) {
          e.preventDefault(); first.focus();
        }
      }
    });

    // 첫 진입 자동 팝업 (로더가 사라진 뒤)
    if (Date.now() >= readHiddenUntil()) {
      window.addEventListener('load', function () {
        setTimeout(function () { openModal(null); }, reduceMotion ? 0 : 900);
      });
    }
  }

  /* ------------------------------------------------------------------ 기타 */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
