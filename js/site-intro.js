/* One brief sketch intro per tab session; no artificial wait on later page visits. */
(()=>{
  const layer=document.getElementById('site-intro');
  if(!layer||!document.documentElement.classList.contains('intro-active'))return;
  // Match the intro illustration to the actual Home eye position,
  // not the viewport center. Uses the rendered layout on any screen size.
  const mainEye=document.querySelector('.hero .friend');
  const syncPosition=()=>{
    if(!mainEye)return;
    const rect=mainEye.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    layer.style.setProperty('--intro-eye-x',(rect.left+rect.width/2)+'px');
    layer.style.setProperty('--intro-eye-y',(rect.top+rect.height/2)+'px');
  };
  syncPosition();
  requestAnimationFrame(syncPosition);
  addEventListener('resize',syncPosition,{passive:true});
  let removed=false;
  const finish=()=>{
    if(removed)return;
    removed=true;
    document.documentElement.classList.remove('intro-active');
    layer.remove();
  };
  layer.addEventListener('animationend',e=>{
    if(e.target===layer)finish();
  });
  // Always release the page, even if animations are interrupted.
  setTimeout(finish,1600);
  addEventListener('pagehide',finish,{once:true});
})();
