/* Shared fixed corner navigation. */
(function(){
 const host=document.getElementById('site-header');
 if(!host)return;
 host.innerHTML='<a class="logo" href="index.html">HAILEY®</a><nav>'+
 
 '<a href="about.html">ABOUT<span class="nav-arrow" aria-hidden="true"> ↗</span></a>'+
 '<a href="mailto:eunhyemon@gmail.com">CONTACT<span class="nav-arrow" aria-hidden="true"> ↗</span></a>'+
 '</nav>';
})();
