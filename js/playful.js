/* Lightweight playful details: draw on the home canvas, confetti on Contact. */
(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('doodle-canvas');
  const clear = document.getElementById('doodle-clear');
  const fine = matchMedia('(pointer:fine)');
  if (hero && canvas && clear && fine.matches) {
    const hint = document.getElementById('doodle-hint');
    if (hint) {
      canvas.addEventListener('pointerenter', () => hint.classList.add('is-visible'));
      canvas.addEventListener('pointermove', e => {
        const bounds = hero.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - bounds.left, bounds.width - 125));
        const y = Math.max(0, Math.min(e.clientY - bounds.top, bounds.height - 32));
        hint.style.left = x + 'px';
        hint.style.top = y + 'px';
      }, {passive:true});
      canvas.addEventListener('pointerleave', () => hint.classList.remove('is-visible'));
      canvas.addEventListener('pointercancel', () => hint.classList.remove('is-visible'));
    }
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const lines = [];
      let current = null;
      let activeId = null;
      let width = 1, height = 1;
      function ink() { return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#111111'; }
      function repaint() {
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = ink();
        ctx.fillStyle = ink();
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        for (const stroke of lines) {
          if (!stroke.length) continue;
          ctx.beginPath();
          ctx.moveTo(stroke[0].x * width, stroke[0].y * height);
          if (stroke.length === 1) {
            ctx.arc(stroke[0].x * width, stroke[0].y * height, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x * width, stroke[i].y * height);
            ctx.stroke();
          }
        }
      }
      function resize() {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(1, rect.width); height = Math.max(1, rect.height);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        repaint();
      }
      function point(e) {
        const rect = canvas.getBoundingClientRect();
        return {x: Math.max(0, Math.min(1, (e.clientX - rect.left) / width)),
                y: Math.max(0, Math.min(1, (e.clientY - rect.top) / height))};
      }
      canvas.addEventListener('pointerdown', e => {
        if (e.button !== 0 || activeId !== null) return;
        activeId = e.pointerId;
        current = [point(e)];
        lines.push(current);
        canvas.setPointerCapture(e.pointerId);
        repaint();
      });
      canvas.addEventListener('pointermove', e => {
        if (e.pointerId !== activeId || !current) return;
        const p = point(e), last = current[current.length - 1];
        if (Math.hypot((p.x - last.x) * width, (p.y - last.y) * height) < 1.5) return;
        current.push(p);
        repaint();
      });
      function stop(e) {
        if (e.pointerId !== activeId) return;
        activeId = null; current = null;
        try {canvas.releasePointerCapture(e.pointerId);} catch (_) {}
      }
      canvas.addEventListener('pointerup', stop);
      canvas.addEventListener('pointercancel', stop);
      clear.addEventListener('click', () => {lines.length = 0; repaint();});
      addEventListener('resize', resize, {passive:true});
      new MutationObserver(repaint).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
      resize();
    }
  }

  const contact = document.querySelector('.contact');
  if (contact && fine.matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let last = 0, count = 0;
    const colors = ['#B7FF38', '#111111', '#8B8B8B', '#B7FF38'];
    contact.addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - last < 90 || count > 30) return;
      last = now;
      for (let n = 0; n < 2; n++) {
        const dot = document.createElement('span');
        dot.className = 'contact-confetti';
        dot.style.left = (e.clientX + (Math.random() * 14 - 7)) + 'px';
        dot.style.top = (e.clientY + (Math.random() * 12 - 6)) + 'px';
        dot.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        dot.style.setProperty('--drift', (Math.random() * 90 - 45) + 'px');
        dot.style.setProperty('--turn', (Math.random() * 400 - 200) + 'deg');
        dot.style.width = (3 + Math.random() * 4) + 'px';
        dot.style.height = (5 + Math.random() * 6) + 'px';
        document.body.appendChild(dot);
        count++;
        dot.addEventListener('animationend', () => {dot.remove(); count--;}, {once:true});
      }
    }, {passive:true});
  }
})();
