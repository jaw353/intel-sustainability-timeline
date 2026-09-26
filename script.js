// Native <details> gives click, touch and keyboard access even without JavaScript.
const timeline = document.querySelector('#timeline');
const previous = document.querySelector('#previous');
const next = document.querySelector('#next');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function move(direction) {
  const step = timeline.querySelector('.milestone').getBoundingClientRect().width + 24;
  timeline.scrollBy({left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
}
function updateControls() {
  previous.disabled = timeline.scrollLeft < 2;
  next.disabled = timeline.scrollLeft >= timeline.scrollWidth - timeline.clientWidth - 2;
}
previous.addEventListener('click', () => move(-1));
next.addEventListener('click', () => move(1));
timeline.addEventListener('scroll', updateControls, {passive:true});
window.addEventListener('resize', updateControls);
timeline.addEventListener('keydown', event => {
  if (event.target !== timeline || window.innerWidth <= 700) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
  }
});
// Hover/focus reveals details temporarily; clicking pins them open.
document.querySelectorAll('.card').forEach(card => {
  const details = card.querySelector('details');
  const summary = details.querySelector('summary');
  let pinned = false, hovering = false;
  const sync = () => { details.open = pinned || hovering || card.contains(document.activeElement); };
  card.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovering = true; sync(); } });
  card.addEventListener('pointerleave', () => { hovering = false; sync(); });
  card.addEventListener('focusin', sync);
  card.addEventListener('focusout', () => setTimeout(sync, 0));
  summary.addEventListener('click', event => { event.preventDefault(); pinned = !pinned; details.open = pinned; });
});
updateControls();
