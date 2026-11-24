/* Scroll inertia on long-form pages only; fixed home and work drag remain untouched. */
(() => {
  if (document.body.classList.contains('work-home') ||
      !matchMedia('(pointer: fine)').matches ||
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof window.Lenis !== 'function') return;

  const lenis = new window.Lenis({
    autoRaf: true,
    lerp: 0.075,
    wheelMultiplier: 0.84,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
    allowNestedScroll: true
  });
  if (window.ScrollTrigger) {
    lenis.on('scroll', () => window.ScrollTrigger.update());
  }
  // Native scrolling is used if the library could not be loaded.
  window.addEventListener('pagehide', () => lenis.destroy(), {once: true});
})();
