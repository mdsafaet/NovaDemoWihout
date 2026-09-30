const fns = new Set();
let raf = 0;
const loop = (t) => {
  fns.forEach((f) => f(t));
  raf = requestAnimationFrame(loop);
};
/** One shared rAF loop. Callbacks run in the order they were added (Lenis first, then WebGL). */
export function addTicker(fn) {
  fns.add(fn);
  if (fns.size === 1) raf = requestAnimationFrame(loop);
  return () => {
    fns.delete(fn);
    if (!fns.size) cancelAnimationFrame(raf);
  };
}
