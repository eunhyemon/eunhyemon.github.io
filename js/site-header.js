/* Persistent portfolio frame: ABOUT bottom-left, CLOSE only on projects. */
(() => {
 const host=document.getElementById('site-header');
 if(!host)return;
 host.innerHTML='<a class="logo" href="index.html">HAILEY®</a>'+
 '<nav aria-label="Site navigation">'+
 '<a class="nav-about" href="about.html">ABOUT<span class="nav-arrow" aria-hidden="true"> ↗</span></a>'+
 '<a class="nav-contact" href="mailto:eunhyemon@gmail.com">CONTACT<span class="nav-arrow" aria-hidden="true"> ↗</span></a>'+
 '<a class="nav-close" href="index.html" aria-label="Close project">CLOSE <span aria-hidden="true">×</span></a>'+
 '</nav>';
})();
