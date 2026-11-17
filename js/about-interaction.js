/* About: gentle mouse-responsive type and hand-drawn marks. */
(() => {
  const scene=document.querySelector('.about-playground');
  if(!scene)return;
  const pieces=[...scene.querySelectorAll('.about-piece')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(pointer:fine)');
  if(!fine.matches || reduce.matches)return;
  let pointer=null, frame=0;
  const offsets=new Map(pieces.map(el=>[el,{x:0,y:0}]));
  function animate(){
    frame=0;
    for(const el of pieces){
      const rect=el.getBoundingClientRect();
      const base=offsets.get(el);
      // Undo its previous offset to estimate the stationary center.
      const cx=rect.left+rect.width/2-base.x;
      const cy=rect.top+rect.height/2-base.y;
      const dx=pointer?cx-pointer.x:0,dy=pointer?cy-pointer.y:0;
      const dist=Math.hypot(dx,dy);
      const influence=pointer && dist<185?Math.pow(1-dist/185,2):0;
      const strength=el.classList.contains('about-mark')?19:13;
      const targetX=dist?dx/dist*strength*influence:0;
      const targetY=dist?dy/dist*strength*influence:0;
      base.x+=(targetX-base.x)*.14;
      base.y+=(targetY-base.y)*.14;
      el.style.translate=base.x.toFixed(2)+'px '+base.y.toFixed(2)+'px';
      if(Math.abs(targetX-base.x)>.15||Math.abs(targetY-base.y)>.15) frame=requestAnimationFrame(animate);
    }
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(animate)}
  scene.addEventListener('pointermove',e=>{pointer={x:e.clientX,y:e.clientY};schedule()},{passive:true});
  scene.addEventListener('pointerleave',()=>{pointer=null;schedule()},{passive:true});
  addEventListener('blur',()=>{pointer=null;schedule()});
})();
