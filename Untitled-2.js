/* =============================================
   app.js — SteamEffect
   Interactividad para la página "Steam: La
   Revolución del Gaming Digital"
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. MENÚ MÓVIL ─────────────────────────── */
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav   = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cierra el menú al hacer clic en un enlace
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  /* ── 2. CONTADOR ANIMADO (stat-number) ────────
     Usa IntersectionObserver para disparar cuando
     las tarjetas del hero entran en pantalla.
  ─────────────────────────────────────────────── */
  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cuadrático
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('es-ES');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('es-ES');
      }
    }

    requestAnimationFrame(step);
  }

  const statNumbers = document.querySelectorAll('.stat-number');

  if ('IntersectionObserver' in window && statNumbers.length) {
    const statsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statsObserver.observe(el));
  } else {
    // Fallback: muestra el valor final directamente
    statNumbers.forEach(el => {
      el.textContent = parseInt(el.dataset.target, 10).toLocaleString('es-ES');
    });
  }

  /* ── 3. BARRAS ANIMADAS (bar-fill) ────────────
     Las barras crecen desde 0% hasta su
     data-width cuando entran en viewport.
  ─────────────────────────────────────────────── */
  const barFills = document.querySelectorAll('.bar-fill');

  if ('IntersectionObserver' in window && barFills.length) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          bar.style.width = bar.dataset.width + '%';
          barObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.3 });

    barFills.forEach(bar => barObserver.observe(bar));
  } else {
    barFills.forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }

  /* ── 4. GRÁFICA DONUT (Canvas 2D) ─────────── */
  const canvas = document.getElementById('donutChart');

  if (canvas) {
    const ctx    = canvas.getContext('2d');
    const W      = canvas.width;
    const H      = canvas.height;
    const cx     = W / 2;
    const cy     = H / 2;
    const radius = W * 0.38;
    const thickness = W * 0.18;

    const segments = [
      { value: 75, color: '#1b9cf2' }, // Steam
      { value: 12, color: '#f07030' }, // Epic
      { value:  4, color: '#8b5cf6' }, // GOG
      { value:  9, color: '#4b5563' }, // Otros
    ];

    const total     = segments.reduce((s, seg) => s + seg.value, 0);
    const startBase = -Math.PI / 2; // parte superior
    const gap       = 0.04;         // radianes entre segmentos

    let animProgress = 0;
    const DURATION   = 1200; // ms
    let startTime    = null;
    let rafId        = null;

    function drawDonut(progress) {
      ctx.clearRect(0, 0, W, H);

      let currentAngle = startBase;
      const totalAngle = Math.PI * 2 * progress;
      let drawn = 0;

      segments.forEach(seg => {
        if (drawn >= totalAngle) return;

        const segAngle = (seg.value / total) * Math.PI * 2;
        const drawAngle = Math.min(segAngle - gap, totalAngle - drawn);
        if (drawAngle <= 0) return;

        ctx.beginPath();
        ctx.arc(cx, cy, radius,           currentAngle, currentAngle + drawAngle);
        ctx.arc(cx, cy, radius - thickness, currentAngle + drawAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();

        currentAngle += segAngle;
        drawn        += segAngle;
      });
    }

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      animProgress   = Math.min(elapsed / DURATION, 1);
      // ease-out cúbico
      const eased    = 1 - Math.pow(1 - animProgress, 3);

      drawDonut(eased);

      if (animProgress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    }

    // Esperar a que el canvas sea visible
    if ('IntersectionObserver' in window) {
      const donutObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            rafId = requestAnimationFrame(animate);
            donutObserver.unobserve(canvas);
          }
        });
      }, { threshold: 0.4 });

      donutObserver.observe(canvas);
    } else {
      rafId = requestAnimationFrame(animate);
    }
  }

  /* ── 5. SCROLL-REVEAL suave (secciones) ──────
     Añade clase "is-visible" cuando las secciones
     entran en viewport para poder animar con CSS.
  ─────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll(
    '.timeline-item, .impact-card, .legacy-card'
  );

  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => {
      el.style.opacity  = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      revealObserver.observe(el);
    });

    // CSS helper para cuando se añade is-visible
    document.head.insertAdjacentHTML('beforeend', `
      <style>
        .is-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      </style>
    `);
  }

}); // end DOMContentLoaded