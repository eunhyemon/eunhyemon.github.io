/* Persistent portfolio corners: minimal links, clipped text-roll hover. */
(() => {
  const host=document.getElementById('site-header');
  if(!host)return;
  const label=word=>'<span class="nav-roll" aria-hidden="true"><span class="nav-roll-line">'+word+'</span><span class="nav-roll-line">'+word+'</span></span>';
  host.innerHTML='<a class="logo" href="index.html" aria-label="Hailey home">'+label('HAILEY®')+'</a>'+
    '<nav aria-label="Site navigation">'+
      '<a class="nav-about" href="about.html" aria-label="About">'+label('ABOUT')+'</a>'+
      '<a class="nav-contact" href="mailto:eunhyemon@gmail.com" aria-label="Contact">'+label('CONTACT')+'</a>'+
      '<a class="nav-close" href="index.html" aria-label="Close project">'+label('CLOSE')+'</a>'+
    '</nav>';
})();
