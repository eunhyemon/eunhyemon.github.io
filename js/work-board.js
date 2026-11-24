/* Work collage: intentional scattered placements, draggable on desktop and touch screens.
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
    const home = document.body.classList.contains('work-home');
    const rows = Math.max(1, Math.ceil(cards.length / 4));
    board.style.setProperty('--board-height', home ? '100%' : (rows * 650 + 45) + 'px');
    const mobileHome = home && matchMedia('(max-width:800px), (pointer:coarse)').matches;
    const homeSlots = mobileHome ? [
      {x:1,y:.045,w:30,r:-5},
      {x:37,y:.02,w:28,r:4},
      {x:73,y:.09,w:26,r:-3},
      {x:14,y:.54,w:34,r:3},
      {x:57,y:.53,w:34,r:-4}
    ] : [
      {x:3,y:.04,w:22,r:-4},
      {x:34,y:.07,w:24,r:3},
      {x:73,y:.03,w:21,r:-3},
      {x:16,y:.55,w:23,r:3},
      {x:56,y:.54,w:23,r:-3}
    ];
    cards.forEach((card, i) => {
      const id = card.getAttribute('href');
      const slot = home ? homeSlots[i % homeSlots.length] : slots[i % slots.length];
      const row = home ? 0 : Math.floor(i / slots.length);
      const maxY = home ? Math.max(0,board.clientHeight-(mobileHome ? Math.min(120,window.innerHeight*.16)+32 : Math.min(218,window.innerHeight*.23)+35)) : 0;
      const naturalY = home ? Math.round(slot.y * board.clientHeight) : slot.y+row*650;
      const pos = layouts.get(id) || {x:slot.x,y:home ? Math.min(maxY,naturalY) : naturalY};
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
        // A tiny paper-settle wobble, only after a completed mouse drag.
        // Animate rotation on the card itself, preserving its scattered base angle.
        if(e.type==='pointerup' && !matchMedia('(prefers-reduced-motion: reduce)').matches){
          const base=getComputedStyle(card).getPropertyValue('--rotation').trim() || '0deg';
          const deg=parseFloat(base) || 0;
          card.getAnimations().filter(anim=>anim.id==='work-card-settle').forEach(anim=>anim.cancel());
          const settle=card.animate([
            {transform:`rotate(${deg+2.2}deg)`,offset:0},
            {transform:`rotate(${deg-1.1}deg)`,offset:.48},
            {transform:`rotate(${deg+.35}deg)`,offset:.78},
            {transform:`rotate(${deg}deg)`,offset:1}
          ],{duration:420,easing:'ease-out'});
          settle.id='work-card-settle';
        }
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
  /* Mobile collage: tap opens; moving a finger drags the card inside the canvas. */
  if (document.body.classList.contains('work-home') && matchMedia('(pointer:coarse)').matches) {
    let gesture = null;
    let suppressUntil = 0;
    const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
    board.addEventListener('pointerdown', e => {
      if(e.pointerType === 'mouse' || !e.isPrimary || gesture || document.body.classList.contains('project-open'))return;
      const card = e.target.closest('.project');
      if(!card || !board.contains(card))return;
      const cardRect = card.getBoundingClientRect();
      const bound = board.getBoundingClientRect();
      gesture = {
        card, id:e.pointerId,
        startX:e.clientX, startY:e.clientY,
        startLeft:cardRect.left, startTop:cardRect.top,
        bound, width:cardRect.width, height:cardRect.height,
        moved:false
      };
      try{card.setPointerCapture(e.pointerId)}catch(_){}
    });
    board.addEventListener('pointermove', e => {
      const g=gesture;
      if(!g || g.id!==e.pointerId)return;
      const dx=e.clientX-g.startX,dy=e.clientY-g.startY;
      if(!g.moved && Math.hypot(dx,dy)<7)return;
      if(!g.moved){
        g.moved=true;
        g.card.classList.add('is-touch-dragging');
        g.card.style.zIndex=String(++topZ);
      }
      e.preventDefault();
      const left=clamp(g.startLeft+dx,g.bound.left,g.bound.right-g.width);
      const top=clamp(g.startTop+dy,g.bound.top,g.bound.bottom-g.height);
      // Translate relative to the card's initial position, not the active touch point.
      g.card.style.setProperty('--touch-x',(left-g.startLeft)+'px');
      g.card.style.setProperty('--touch-y',(top-g.startTop)+'px');
    },{passive:false});
    const finish=e=>{
      const g=gesture;
      if(!g || e.pointerId!==g.id)return;
      if(g.moved){
        g.card.classList.remove('is-touch-dragging');
        const left=parseFloat(g.card.style.getPropertyValue('--touch-x'))||0;
        const top=parseFloat(g.card.style.getPropertyValue('--touch-y'))||0;
        const boardRect=board.getBoundingClientRect();
        // Persist the new position in the same coordinates as the desktop board.
        const originalLeft=(parseFloat(g.card.style.getPropertyValue('--x'))||0)*boardRect.width/100;
        const originalTop=parseFloat(g.card.style.getPropertyValue('--y'))||0;
        layouts.set(g.card.getAttribute('href'),{
          x:100*(originalLeft+left)/Math.max(1,boardRect.width),
          y:originalTop+top
        });
        g.card.style.setProperty('--x',100*(originalLeft+left)/Math.max(1,boardRect.width)+'%');
        g.card.style.setProperty('--y',(originalTop+top)+'px');
        g.card.style.removeProperty('--touch-x');
        g.card.style.removeProperty('--touch-y');
        suppressUntil=performance.now()+500;
      }
      try{g.card.releasePointerCapture(e.pointerId)}catch(_){}
      gesture=null;
    };
    board.addEventListener('pointerup',finish);
    board.addEventListener('pointercancel',finish);
    board.addEventListener('click',e=>{
      if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}
    },true);
  }
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
        const dragging=card.classList.contains('is-dragging');
        hint.textContent=dragging?'DRAG!':(card.querySelector('.meta h3')?.textContent?.trim() || 'VIEW WORK');
        hint.style.left=Math.min(e.clientX,innerWidth-180)+'px';
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
  addEventListener('resize', () => { layout(); });
  layout();
})();
