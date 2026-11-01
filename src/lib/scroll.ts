// One scroll listener for the whole page. Subscribers run once per animation frame after a scroll or resize,
// so pinned stages, parallax and the rail never each attach their own handler.
type Fn = () => void;
const subs = new Set<Fn>();
let queued = false;
let bound = false;

function run() {
  queued = false;
  subs.forEach((fn) => fn());
}
function queue() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(run);
}

export function onScroll(fn: Fn) {
  if (typeof window === "undefined") return () => {};
  if (!bound) {
    bound = true;
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
  }
  subs.add(fn);
  fn();
  return () => {
    subs.delete(fn);
  };
}

// 0 when the element's top reaches the bottom of the viewport, 1 when its bottom leaves the top.
export function progress(el: Element) {
  const r = el.getBoundingClientRect();
  const span = r.height + innerHeight;
  return Math.min(1, Math.max(0, (innerHeight - r.top) / span));
}

// For a tall section with a sticky child: 0 when it pins, 1 when it releases.
export function pinProgress(el: Element) {
  const r = el.getBoundingClientRect();
  const span = r.height - innerHeight;
  if (span <= 0) return r.top <= 0 ? 1 : 0;
  return Math.min(1, Math.max(0, -r.top / span));
}

export const reducedMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// The theme ("dark" | "light") of the section under a point on screen, read from data-theme.
export function themeAt(x: number, y: number, skip?: Element | null) {
  for (const el of document.elementsFromPoint(x, y)) {
    if (skip && skip.contains(el)) continue;
    const t = el.closest<HTMLElement>("[data-theme]");
    if (t && !t.closest(".rail, .topbar")) {
      // a stage's torn-edge bands (pointer-events: none, so never hit) end in parchment: light over their paper end
      for (const band of t.querySelectorAll<HTMLElement>(":scope > .torn")) {
        const r = band.getBoundingClientRect();
        if (y < r.top || y > r.bottom) continue;
        const fromPaper = band.classList.contains("torn--top") ? (y - r.top) / r.height : (r.bottom - y) / r.height;
        if (fromPaper < 0.4) return "light";
      }
      return t.dataset.theme as "dark" | "light";
    }
  }
  return "light";
}

// Progress of the hero's index morphing into the rail: 0 at the top of the page, 1 a little past the hero's middle.
export function heroMorph() {
  const hero = typeof document !== "undefined" ? document.querySelector<HTMLElement>(".hero") : null;
  if (!hero) return 1;
  return Math.min(1, Math.max(0, scrollY / (hero.offsetHeight * 0.55)));
}

// For the home links (the logo and the rail's masthead). Next's Link does nothing when it points at the page you're
// already on, so on the home page these scroll back to the top themselves, through Lenis when it's running so the
// smooth scroll and the scroll effects stay in step. Elsewhere the Link navigates home as usual.
export function toTop(e: { preventDefault(): void; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; button: number }) {
  if (location.pathname !== "/" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  if (location.hash) history.replaceState(null, "", "/");
  const lenis = (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;
  if (lenis) lenis.scrollTo(0, reducedMotion() ? { immediate: true } : { duration: 1.6 });
  else scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
}
