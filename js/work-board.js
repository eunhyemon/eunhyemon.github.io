/* Work collage: intentional scattered placements, draggable on desktop.
   This file does not affect project detail pages or project data. */
(() => {
  const board = document.getElementById('projects');
  if (!board) return;
  const desktop = matchMedia('(min-width: 801px) and (pointer: fine)');
  const slots = [
    {x: 6, y: 28, w: 26, r: -5},
    {x: 56, y: 48, w: 36, r: 4},
    {x: 34, y: 345, w: 29, r: -3},
    {x: 72, y: 460, w: 21, r: 6}
  ];
  let topZ = 20;
  const layouts = new Map();
  let revealObserver = null;
  function reveal(cards) {
    if (revealObserver) revealObserver.disconnect();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible');
        entry.target.classList.remove('motion-pending');
        revealObserver.unobserve(entry.target);
      });
    }, {threshold:.08, rootMargin:'0px 0px 60px 0px'});
    cards.forEach((card,i) => {
      card.style.setProperty('--reveal-delay', ((i % 4) * 105) + 'ms');
      card.classList.add('motion-pending');
      revealObserver.observe(card);
    });
  }
  function layout() {
    const cards = Array.from(board.querySelectorAll('.project'));
    const rows = Math.max(1, Math.ceil(cards.length / 4));
    board.style.setProperty('--board-height', (rows * 650 + 45) + 'px');
    cards.forEach((card, i) => {
      const id = card.getAttribute('href');
      const slot = slots[i % slots.length];
      const row = Math.floor(i / slots.length);
      const pos = layouts.get(id) || {x:slot.x,y:slot.y+row*650};
      card.style.setProperty('--x',pos.x+'%');
      card.style.setProperty('--y',pos.y+'px');
      card.style.setProperty('--w',slot.w+'%');
      card.style.setProperty('--rotation',slot.r+'deg');
      card.style.zIndex=String(i+1);
      card.querySelectorAll('img').forEach(img=>{img.draggable=false;});
    });
    reveal(cards);
  }
  board.addEventListener('dragstart',event=>event.preventDefault());
  board.addEventListener('pointerdown', event => {
    if (!desktop.matches || event.button !== 0) return;
    const card = event.target.closest('.project');
    if (!card || !board.contains(card)) return;
    const rect = board.getBoundingClientRect();
    const initial = card.getBoundingClientRect();
    const startX = event.clientX, startY = event.clientY;
    const maxX = Math.max(0, rect.width-initial.width);
    const maxY = Math.max(0, board.offsetHeight-initial.height);
    let moved=false, running=false, raf=0;
    const current={x:initial.left-rect.left,y:initial.top-rect.top};
    const target={...current};
    const id=card.getAttribute('href');
    const update=()=>{
      const ease=.19; // a soft trailing movement rather than a rigid 1:1 drag
      current.x+=(target.x-current.x)*ease;
      current.y+=(target.y-current.y)*ease;
      card.style.setProperty('--x',((current.x/rect.width)*100)+'%');
      card.style.setProperty('--y',current.y+'px');
      if (Math.hypot(target.x-current.x,target.y-current.y)>.25) raf=requestAnimationFrame(update);
      else {current.x=target.x;current.y=target.y;card.style.setProperty('--x',((current.x/rect.width)*100)+'%');card.style.setProperty('--y',current.y+'px');running=false;}
    };
    card.style.zIndex=String(++topZ);
    const move=e=>{
      if(e.pointerId!==event.pointerId)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(!moved&&Math.hypot(dx,dy)<7)return;
      moved=true;card.classList.add('is-dragging');
      target.x=Math.min(maxX,Math.max(0,initial.left-rect.left+dx));
      target.y=Math.min(maxY,Math.max(0,initial.top-rect.top+dy));
      layouts.set(id,{x:(target.x/rect.width)*100,y:target.y});
      if(!running){running=true;raf=requestAnimationFrame(update);}
    };
    const end=e=>{
      if(e.pointerId!==event.pointerId)return;
      card.removeEventListener('pointermove',move);
      card.removeEventListener('pointerup',end);
      card.removeEventListener('pointercancel',end);
      if(moved){
        card.classList.remove('is-dragging');
        // A released drag must not follow the link; a simple click still navigates.
        const block=click=>{click.preventDefault();click.stopImmediatePropagation();};
        card.addEventListener('click',block,{capture:true,once:true});
        setTimeout(()=>card.removeEventListener('click',block,true),200);
      }
      try{card.releasePointerCapture(event.pointerId)}catch(_){}
    };
    card.addEventListener('pointermove',move);
    card.addEventListener('pointerup',end);
    card.addEventListener('pointercancel',end);
    try{card.setPointerCapture(event.pointerId)}catch(_){}
  });
  /* Cursor-following DRAG! label over draggable cards only. */
  if (desktop.matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const hint=document.createElement('span');
    hint.id='work-drag-hint';
    hint.textContent='DRAG!';
    hint.setAttribute('aria-hidden','true');
    document.body.appendChild(hint);
    const setVisible=(e)=>{
      const card=e.target.closest?.('.project');
      const visible=!!card && board.contains(card);
      hint.classList.toggle('is-visible',visible);
      if(visible){
        hint.style.left=Math.min(e.clientX,innerWidth-85)+'px';
        hint.style.top=Math.min(e.clientY,innerHeight-45)+'px';
      }
    };
    board.addEventListener('pointermove',setVisible,{passive:true});
    board.addEventListener('pointerover',setVisible,{passive:true});
    board.addEventListener('pointerout',e=>{
      if(!e.relatedTarget || !e.relatedTarget.closest?.('.project')) hint.classList.remove('is-visible');
    });
    board.addEventListener('pointerleave',()=>hint.classList.remove('is-visible'));
    addEventListener('blur',()=>hint.classList.remove('is-visible'));
  }
  board.addEventListener('work:rendered', layout);
  addEventListener('resize', () => { if (desktop.matches) layout(); });
  layout();
})();
