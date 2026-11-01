// Glyph helpers for the footer's "terminal inside a print magazine" effects: flickering ring letters, link and
// wordmark scrambles. Everything here is DOM-free except scramble(), which writes textContent.
export const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789▚▞░▒/\\<>";
export const BLOCKS = "▚▞▖▗▘▝░▒01<>/\\#";

export const pick = (set: string) => set[(Math.random() * set.length) | 0];

// Cycle an element's text through random glyphs and lock it in left to right over `ms`. Spaces and the characters
// in `keep` never scramble. Returns a cancel function that restores the final text at once.
export function scramble(el: HTMLElement, final: string, ms: number, opts: { from?: number; to?: number; keep?: string } = {}) {
  const from = opts.from ?? 0;
  const to = Math.min(final.length, opts.to ?? final.length);
  const keep = opts.keep ?? " .✓";
  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const k = Math.min(1, (now - t0) / ms);
    const locked = from + Math.floor(k * (to - from));
    let out = final.slice(0, locked);
    for (let i = locked; i < to; i++) out += keep.includes(final[i]) ? final[i] : pick(GLYPHS);
    el.textContent = out + final.slice(to);
    if (k < 1) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = final;
  };
}

// India Standard Time, ticking: HH:MM:SS, no matter where the visitor is.
export const istTime = (d = new Date()) =>
  d.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
