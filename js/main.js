(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const range = (p, a, b) => clamp((p - a) / (b - a));

  /* ---------- mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open);
      toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    });
    document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', false);
    }));
  }

  /* ---------- reveal on view ---------- */
  const targets = document.querySelectorAll('[data-reveal], .lines');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach(t => io.observe(t));
  } else {
    targets.forEach(t => t.classList.add('in'));
  }
  // hero headline straight away
  requestAnimationFrame(() => document.querySelectorAll('.hero [data-reveal], .hero .lines, .page-hero [data-reveal], .page-hero .lines').forEach(el => el.classList.add('in')));

  /* ---------- scroll-driven pieces ---------- */
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('hero');
  const portal = document.getElementById('portal');
  const copy = hero && hero.querySelector('.hero__copy');
  const eye = hero && hero.querySelector('.hero__eye');
  const pupil = document.getElementById('pupil');
  const pz = portal ? [...portal.querySelectorAll('[data-pz]')] : [];
  const marquees = [...document.querySelectorAll('[data-marquee]')];
  const routes = [...document.querySelectorAll('.route')];
  const darkZones = [...document.querySelectorAll('[data-dark]')];
  const stackOn = () => window.matchMedia('(min-width: 901px)').matches;

  let lastY = window.scrollY;
  let ticking = false;
  let heroDark = false;

  function frame() {
    ticking = false;
    const y = window.scrollY;
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // header: hide on scroll down, show on scroll up
    if (header) {
      header.classList.toggle('is-scrolled', y > 20);
      if (!document.body.classList.contains('menu-open')) {
        header.classList.toggle('is-hidden', y > lastY && y > 300);
      }
    }

    // hero: the eye opens and swallows the screen
    if (hero && portal && !reduce) {
      const r = hero.getBoundingClientRect();
      const total = r.height - vh;
      const p = clamp(-r.top / total);

      const cp = ease(range(p, 0, 0.42));
      copy.style.transform = `translate3d(0, ${-cp * 90}px, 0) scale(${1 - cp * 0.06})`;
      copy.style.opacity = 1 - range(p, 0.08, 0.38);

      const es = 1 + ease(range(p, 0, 0.35)) * 0.45;
      const er = range(p, 0, 0.35) * -18;
      eye.style.transform = `scale(${es}) rotate(${er}deg)`;

      const pr = pupil.getBoundingClientRect();
      const stage = portal.parentElement.getBoundingClientRect();
      const cx = pr.left + pr.width * 0.5 - stage.left;
      const cy = pr.top + pr.height * 0.5 - stage.top;
      const maxR = Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy)) + 20;
      const op = ease(range(p, 0.1, 0.5));
      const rad = op * maxR;
      portal.style.clipPath = `circle(${rad.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      portal.classList.toggle('is-open', op > 0.98);

      pz.forEach((el, i) => {
        const t = ease(range(p, 0.42 + i * 0.07, 0.62 + i * 0.07));
        el.style.opacity = t;
        el.style.transform = `translate3d(0, ${(1 - t) * 40}px, 0)`;
      });
      heroDark = op > 0.55 && r.bottom > 40;
    }

    // header colour over dark areas
    if (header) {
      let dark = heroDark;
      if (!dark) {
        for (const z of darkZones) {
          const zr = z.getBoundingClientRect();
          if (zr.top <= 42 && zr.bottom >= 42) { dark = true; break; }
        }
      }
      header.classList.toggle('is-dark', dark);
    }

    // marquee follows the scroll
    if (!reduce) {
      marquees.forEach(m => {
        const mr = m.getBoundingClientRect();
        if (mr.bottom < -200 || mr.top > vh + 200) return;
        const shift = (mr.top - vh) * 0.45;
        const half = m.scrollWidth / 2;
        let x = shift % half;
        if (x > 0) x -= half;
        m.style.transform = `translate3d(${x}px, 0, 0)`;
      });
    }

    // services: panels stack and recede
    if (!reduce && stackOn()) {
      routes.forEach((card, i) => {
        const next = routes[i + 1];
        if (!next) { card.style.transform = ''; card.style.filter = ''; return; }
        const nr = next.getBoundingClientRect();
        const stickyTop = parseFloat(getComputedStyle(next).top) || 0;
        const p = clamp(1 - (nr.top - stickyTop) / (vh * 0.85));
        // also count cards further down for a deeper stack
        let depth = p;
        for (let j = i + 2; j < routes.length; j++) {
          const jr = routes[j].getBoundingClientRect();
          const jt = parseFloat(getComputedStyle(routes[j]).top) || 0;
          depth += clamp(1 - (jr.top - jt) / (vh * 0.85));
        }
        card.style.transform = `scale(${1 - depth * 0.045})`;
        card.style.filter = `brightness(${1 - depth * 0.12})`;
      });
    } else {
      routes.forEach(c => { c.style.transform = ''; c.style.filter = ''; });
    }

    lastY = y;
  }

  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* ---------- testimonials ---------- */
  const q = document.getElementById('quotes');
  document.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
    const card = q.querySelector('.quote');
    const step = card ? card.getBoundingClientRect().width + 32 : 400;
    q.scrollBy({ left: step * Number(b.dataset.q), behavior: reduce ? 'auto' : 'smooth' });
  }));
})();

/* ---------- footer eye: kijkt mee ---------- */
(() => {
  const eye = document.querySelector('.foot-eye');
  if (!eye) return;
  const look = eye.querySelector('.foot-eye__look');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAX = 8.5;                     // maximale uitslag van de pupil (in viewBox-eenheden)
  let tx = 0, ty = 0, x = 0, y = 0, lastMove = 0, raf = null;

  function aim(px, py) {
    const r = eye.getBoundingClientRect();
    const cx = r.left + r.width * (56 / 120), cy = r.top + r.height * (68 / 120);
    const dx = px - cx, dy = py - cy;
    const d = Math.hypot(dx, dy) || 1;
    const k = Math.min(1, d / 260);
    tx = dx / d * MAX * k; ty = dy / d * MAX * k;
    lastMove = performance.now();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick(t) {
    // geen muis? dan rustig rondkijken
    if (t - lastMove > 2500) { tx = Math.sin(t / 1300) * MAX * .7; ty = Math.cos(t / 1700) * MAX * .4; }
    x += (tx - x) * .12; y += (ty - y) * .12;
    look.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
    raf = requestAnimationFrame(tick);
  }
  if (reduce) return;

  // alleen animeren als de footer in beeld is
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) raf = requestAnimationFrame(tick); }
    else if (raf) { cancelAnimationFrame(raf); raf = null; }
  }).observe(eye);

  window.addEventListener('pointermove', e => aim(e.clientX, e.clientY), { passive: true });

  // hover op een contactknop: het oog kijkt ernaar en wordt enthousiast
  document.querySelectorAll('.contact__rows a').forEach(a => {
    a.addEventListener('pointerenter', () => eye.classList.add('is-wow'));
    a.addEventListener('pointerleave', () => eye.classList.remove('is-wow'));
    a.addEventListener('focus', () => { const r = a.getBoundingClientRect(); aim(r.left + r.width / 2, r.top); eye.classList.add('is-wow'); });
    a.addEventListener('blur', () => eye.classList.remove('is-wow'));
  });

  // klik op het oog: knipoog
  eye.addEventListener('click', () => {
    eye.classList.remove('is-wink'); void eye.offsetWidth; eye.classList.add('is-wink');
  });
})();
