/* Keep the persistent site frame visually stationary during navigation.
   Modern browsers use native cross-document View Transitions above.
   Older browsers fade only the page content, never the fixed header. */
(() => {
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const nativeTransition=('onpageswap' in window)&&CSS.supports('view-transition-name','portfolio-logo');
 if(nativeTransition||reduced)return;
 let navigating=false;
 root.classList.add('page-entering');
 requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.remove('page-entering')));
 addEventListener('pageshow',()=>{navigating=false;root.classList.remove('page-leaving','page-entering')});
 document.addEventListener('click',e=>{
  if(navigating||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const a=e.target.closest?.('a[href]');
  if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
  if(document.body.classList.contains('work-home') && a.classList.contains('project'))return;
  const url=new URL(a.href,location.href);
  if(!['http:','https:'].includes(url.protocol)||url.origin!==location.origin||
     (url.pathname===location.pathname&&url.search===location.search))return;
  e.preventDefault();navigating=true;root.classList.add('page-leaving');
  setTimeout(()=>{location.href=url.href},205);
 },{capture:true});
})();
