/* Subtle cross-page navigation. Native links and browser history remain intact. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let navigating = false;
  if (!reduced.matches) {
    root.classList.add('page-entering');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('page-entering')));
  }
  const reset = () => { navigating = false; root.classList.remove('page-leaving','page-entering'); };
  addEventListener('pageshow', reset);
  document.addEventListener('click', event => {
    if (reduced.matches || navigating || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href, location.href);
    if (!['http:', 'https:'].includes(destination.protocol) ||
        destination.origin !== location.origin ||
        (destination.pathname === location.pathname && destination.search === location.search)) return;
    event.preventDefault();
    navigating = true;
    root.classList.add('page-leaving');
    setTimeout(() => { location.href = destination.href; }, 215);
  }, {capture:true});
})();
