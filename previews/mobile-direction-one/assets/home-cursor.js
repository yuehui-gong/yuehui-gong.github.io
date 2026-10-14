(() => {
  if (document.body.dataset.page !== 'home') return;

  const finePointer = matchMedia('(any-hover: hover) and (any-pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const cursor = document.createElement('div');
  cursor.className = 'home-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const point = document.createElement('span');
  point.className = 'home-cursor__point';
  const ring = document.createElement('span');
  ring.className = 'home-cursor__ring';
  point.appendChild(ring);
  const sparks = Array.from({ length: 7 }, () => {
    const element = document.createElement('span');
    element.className = 'home-cursor__spark';
    cursor.appendChild(element);
    return { element, x: 0, y: 0, born: -Infinity };
  });
  cursor.appendChild(point);
  document.body.appendChild(cursor);

  const lifetime = 220;
  const trailLength = 42;
  const spacing = 6;
  let x = 0, y = 0, anchorX = 0, anchorY = 0;
  let visible = false, nextSpark = 0, frame = 0;

  function clearTrail() {
    cancelAnimationFrame(frame);
    frame = 0;
    sparks.forEach(spark => {
      spark.born = -Infinity;
      spark.element.style.opacity = '0';
    });
  }

  function hide() {
    visible = false;
    cursor.classList.remove('is-visible');
    document.body.classList.remove('home-cursor-active');
    clearTrail();
  }

  function drawTrail(now) {
    frame = 0;
    let alive = false;
    sparks.forEach(spark => {
      const age = (now - spark.born) / lifetime;
      const distance = Math.hypot(x - spark.x, y - spark.y);
      if (age >= 1 || distance > trailLength) {
        spark.born = -Infinity;
        spark.element.style.opacity = '0';
        return;
      }
      alive = true;
      const fade = (1 - age) * (1 - distance / (trailLength + spacing));
      spark.element.style.opacity = String(fade * .6);
      spark.element.style.transform =
        `translate3d(${spark.x}px, ${spark.y}px, 0) scale(${.4 + fade * .6})`;
    });
    // The pulse uses CSS; this loop stops as soon as the short trail fades.
    if (alive) frame = requestAnimationFrame(drawTrail);
  }

  document.addEventListener('pointermove', event => {
    if (!finePointer.matches || event.pointerType !== 'mouse') {
      hide();
      return;
    }
    x = event.clientX;
    y = event.clientY;
    point.style.transform = `translate3d(${x}px, ${y}px, 0)`;

    if (!visible) {
      anchorX = x;
      anchorY = y;
      visible = true;
      cursor.classList.add('is-visible');
      document.body.classList.add('home-cursor-active');
    }

    const dx = x - anchorX, dy = y - anchorY;
    const distance = Math.hypot(dx, dy);
    if (reducedMotion.matches || distance < spacing) return;

    const now = performance.now();
    const count = Math.min(sparks.length, Math.floor(distance / spacing));
    for (let i = count; i > 0; i--) {
      const spark = sparks[nextSpark];
      nextSpark = (nextSpark + 1) % sparks.length;
      spark.x = x - dx / distance * i * spacing;
      spark.y = y - dy / distance * i * spacing;
      spark.born = now;
    }
    anchorX = x;
    anchorY = y;
    if (!frame) frame = requestAnimationFrame(drawTrail);
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', hide);
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse') hide();
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') hide();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hide();
  });
  window.addEventListener('blur', hide);
  window.addEventListener('pagehide', hide);
  finePointer.addEventListener('change', hide);
  reducedMotion.addEventListener('change', clearTrail);
})();
