/* One brief sketch intro per tab session; no artificial wait on later page visits. */
(()=>{
  const layer=document.getElementById('site-intro');
  if(!layer||!document.documentElement.classList.contains('intro-active'))return;
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
