(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const toggle = document.querySelector('.motion-toggle');
  let paused = false;

  // Filtros de proyectos
  const filters = document.querySelector('.filters');
  const projects = [...document.querySelectorAll('.project')];
  const status = document.getElementById('resultados');
  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', e => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      const f = btn.dataset.filter;
      filters.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      let n = 0;
      projects.forEach(p => { const show = f === 'all' || p.dataset.category.split(' ').includes(f); p.hidden = !show; if (show) n++; });
      if (status) status.textContent = n + (n === 1 ? ' proyecto visible' : ' proyectos visibles');
    });
  }

  // Navegación lateral: sección activa
  const navLinks = [...document.querySelectorAll('.side-nav a')];
  const ids = navLinks.map(a => a.getAttribute('href').slice(1));
  const spy = () => {
    let cur = ids[0];
    ids.forEach(id => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < innerHeight * .45) cur = id; });
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + cur) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };
  spy(); addEventListener('scroll', spy, { passive: true });

  // Cintas de líneas animadas
  const c = document.querySelector('.line-field');
  const ctx = c?.getContext('2d');
  const DENSITY = 15;
  const A = [2, 213, 135], B = [76, 116, 255], ALPHA = .55;
  const ribbons = [
    { cy: .28, amp: .16, k: .0042, k2: .0021, sp: .35, spread: .22, twist: 2.6, ph: 0 },
    { cy: .78, amp: .12, k: .0034, k2: .0028, sp: -.28, spread: .18, twist: 3.4, ph: 2 },
  ];
  let w, h, mx = -9999, my = -9999;
  let frame = null;
  let elapsed = 0;
  let previousFrame = null;

  function fit() {
    if (!ctx) return;
    w = c.clientWidth;
    h = c.clientHeight;
    const scale = Math.min(2, devicePixelRatio || 1);
    c.width = Math.round(w * scale);
    c.height = Math.round(h * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    draw(elapsed);
  }

  addEventListener('pointermove', event => {
    mx = event.clientX;
    my = event.clientY;
  }, { passive: true });

  function draw(time) {
    ctx.clearRect(0, 0, w, h);
    ribbons.forEach(r => {
      for (let i = 0; i < DENSITY; i++) {
        const p = i / (DENSITY - 1);
        const col = A.map((v, j) => Math.round(v + (B[j] - v) * p));
        ctx.strokeStyle = `rgba(${col},${ALPHA * (.35 + .65 * Math.sin(p * Math.PI))})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -40; x <= w + 40; x += 10) {
          const env = Math.sin(time * .5 * r.sp + x * r.k2 + p * Math.PI + r.ph);
          let y = h * r.cy + h * r.amp * Math.sin(x * r.k + time * r.sp + p * r.twist + r.ph) + (p - .5) * h * r.spread * env;
          y += Math.exp(-(((x - mx) / 160) ** 2) - (((y - my) / 220) ** 2)) * 120 * (p - .5);
          x === -40 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
  }

  function animate(now) {
    if (previousFrame !== null) elapsed += (now - previousFrame) / 1000;
    previousFrame = now;
    draw(elapsed);
    frame = requestAnimationFrame(animate);
  }

  function syncMotion() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousFrame = null;
    const running = !paused && !motion.matches && !document.hidden;
    document.documentElement.classList.toggle('motion-running', running);
    if (toggle) {
      toggle.hidden = motion.matches;
      toggle.textContent = paused ? 'Reanudar animación' : 'Pausar animación';
      toggle.toggleAttribute('data-paused', paused);
    }
    if (running && ctx) frame = requestAnimationFrame(animate);
  }

  toggle?.addEventListener('click', () => {
    paused = !paused;
    syncMotion();
  });
  motion.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  addEventListener('resize', fit);
  fit();
  syncMotion();
})();
