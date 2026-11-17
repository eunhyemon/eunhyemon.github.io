/* Work collage: intentional scattered placements, draggable on desktop.
   This file does not affect project detail pages or project data. */
(() => {
  const board = document.getElementById('projects');
  if (!board) return;
  const desktop = matchMedia('(min-width: 801px) and (pointer: fine)');
  const slots = [
    {x: 5, y: 25, w: 31, r: -5},
    {x: 59, y: 45, w: 32, r: 4},
    {x: 32, y: 335, w: 30, r: -3},
    {x: 67, y: 440, w: 25, r: 6},
    {x: 12, y: 475, w: 29, r: 5},
    {x: 49, y: 270, w: 27, r: -5}
  ];
  let topZ = 20;
  let suppressed = null;
  const layouts = new Map();
  function layout() {
    const cards = Array.from(board.querySelectorAll('.project'));
    const rows = Math.max(1, Math.ceil(cards.length / 4));
    board.style.setProperty('--board-height', (rows * 650 + 45) + 'px');
    cards.forEach((card, i) => {
      const id = card.getAttribute('href');
      const slot = slots[i % slots.length];
      const row = Math.floor(i / slots.length);
      const proposed = layouts.get(id);
      const pos = proposed || {x: slot.x, y: slot.y + row * 650};
      card.style.setProperty('--x', pos.x + '%');
      card.style.setProperty('--y', pos.y + 'px');
      card.style.setProperty('--w', slot.w + '%');
      card.style.setProperty('--rotation', slot.r + 'deg');
      card.style.zIndex = String(i + 1);
      card.querySelectorAll('img').forEach(img => { img.draggable = false; });
    });
  }
  board.addEventListener('click', event => {
    if (suppressed && event.target.closest('.project') === suppressed) {
      event.preventDefault();
      event.stopPropagation();
      suppressed = null;
    }
  }, true);
  board.addEventListener('dragstart', event => event.preventDefault());
  board.addEventListener('pointerdown', event => {
    if (!desktop.matches || event.button !== 0) return;
    const card = event.target.closest('.project');
    if (!card || !board.contains(card)) return;
    const rect = board.getBoundingClientRect();
    const start = {x: event.clientX, y: event.clientY};
    const old = card.getBoundingClientRect();
    let moved = false;
    card.style.zIndex = String(++topZ);
    const move = e => {
      if (e.pointerId !== event.pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!moved && Math.hypot(dx, dy) < 7) return;
      moved = true;
      card.classList.add('is-dragging');
      const maxX = Math.max(0, rect.width - old.width);
      const maxY = Math.max(0, board.offsetHeight - old.height);
      const x = Math.min(maxX, Math.max(0, old.left - rect.left + dx));
      const y = Math.min(maxY, Math.max(0, old.top - rect.top + dy));
      const percent = rect.width ? (x / rect.width) * 100 : 0;
      card.style.setProperty('--x', percent + '%');
      card.style.setProperty('--y', y + 'px');
      layouts.set(card.getAttribute('href'), {x: percent, y});
    };
    const end = e => {
      if (e.pointerId !== event.pointerId) return;
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', end);
      card.removeEventListener('pointercancel', end);
      if (moved) {
        suppressed = card;
        card.classList.remove('is-dragging');
      }
      try { card.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', end);
    try { card.setPointerCapture(event.pointerId); } catch (_) {}
  });
  board.addEventListener('work:rendered', layout);
  addEventListener('resize', () => { if (desktop.matches) layout(); });
  layout();
})();
