// Phone framing for the paintings.
//
// "object-fit: cover" on a tall phone screen shows only (screen ratio ÷ image ratio) of a painting's width: about 58%
// of the portrait Jerome (which reads well), but only 38% of the windmill, 26% of the Data film and 21% of the
// Creation of Adam, so they read as a blurry close-up. On phones we never show less than `minVisible` of the width:
// the painting is scaled down to that, centred on its focal point, and if it no longer fills the screen's height the
// band above and below is filled by a blurred copy of the same painting (the "ambient" layer).

export const PHONE_MAX = 767;
export const MIN_VISIBLE = 0.58;

export type Box = { x: number; y: number; w: number; h: number; fitted: boolean };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Where to draw an image of aspect `ar` (w/h) inside a `vw`×`vh` viewport.
 * fx, fy: the focal point as fractions of the image (like object-position).
 * centerY: where the band's centre sits on screen when the image is smaller than the screen.
 * screenH: the visible screen height, when the box being filled is taller than the screen (parallax overscan).
 */
export function frame(vw: number, vh: number, ar: number, fx = 0.5, fy = 0.5, minVisible = MIN_VISIBLE, centerY = 0.45, screenH = vh): Box {
  // plain cover first; whether it shows enough is judged against the screen (screenH), not a taller parallax box
  const cw = Math.max(vw, vh * ar);
  const ch = cw / ar;
  if (vw / Math.max(vw, screenH * ar) >= minVisible) return { x: (vw - cw) * fx, y: (vh - ch) * fy, w: cw, h: ch, fitted: false };
  // too tight: show minVisible of the width, keep the focal point on screen, sit the band at centerY
  const w = vw / minVisible;
  const h = w / ar;
  const x = clamp(vw / 2 - fx * w, vw - w, 0);
  const y = h >= vh ? clamp(vh / 2 - fy * h, vh - h, 0) : clamp(vh * centerY - h / 2, 0, vh - h);
  return { x, y, w, h, fitted: true };
}

// "60% 55%" → [0.6, 0.55]
export function focal(pos: string): [number, number] {
  const [a, b] = pos.split(/\s+/).map((v) => parseFloat(v) / 100);
  return [Number.isFinite(a) ? a : 0.5, Number.isFinite(b) ? b : 0.5];
}
