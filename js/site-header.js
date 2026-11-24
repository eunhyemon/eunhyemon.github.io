/* Shared header markup for every page. Edit this file to change the logo, links, or theme icon. */
(function(){
  const host=document.getElementById('site-header');
  if(!host)return;
  host.innerHTML="<a class=\"logo\" href=\"index.html\">HAILEY®</a><nav><a href=\"work.html\">WORK ↗</a><a href=\"about.html\">ABOUT ↗</a><a href=\"mailto:eunhyemon@gmail.com\">CONTACT ↗</a><button class=\"theme-toggle\" type=\"button\" aria-label=\"다크 모드로 변경\" aria-pressed=\"false\" title=\"Dark mode\"><svg viewBox=\"0 0 68 30\" aria-hidden=\"true\" focusable=\"false\"><path class=\"sun-shape\" d=\"M18.5 5 C22.3 4.7 26.8 7.8 28.1 12 C30.4 17.3 27.1 22.8 22.1 24.7 C16.7 27 11.1 23.9 9.1 19.3 C6.8 13.8 9.5 8.3 14.1 6.5 C15.6 5.8 17.3 5.2 18.5 5 Z\"/><path class=\"moon-shape\" d=\"M48.2 2.3 C55.3 4.2 61.5 11.7 61.2 17.7 C60.7 23.8 53.3 27.1 41.8 27.9 C49.9 22.5 53.4 12.9 48.2 2.3 Z\"/></svg></button></nav>";
})();
