"use client";

import { useEffect, useRef } from "react";

/* ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
   The torn paper edge between a painting stage and the parchment: a WebGL noise-threshold wipe.

   Parchment covers the band wherever  edge = lift − y + fBm·0.09 + lean·0.05 + grain  is positive. Coverage is
   smoothstep(±fwidth(edge)·10), so where the per-pixel grain makes the edge change fast the blend breaks into specks
   (the glitter), and parchment pixels right at the threshold are brightened 2–4× (the fibre rim), with a sparkle
   wave travelling sideways. The fBm drifts with time and scroll, so the tear is always gently alive.

   One offscreen WebGL2 context (made once, textures generated in JS) renders each visible band and copies it into
   the band's own 2D canvas; one rAF loop runs only while a band is on screen. Without WebGL2, or if the context is
   lost, the band shows the old static polygon. Reduced motion: one frame, no loop.
   ────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

/* ── fallback: the original hand-torn polygon ─────────────────────────────────────────────────────────────── */
const W = 1440,
  H = 70,
  N = 180;
const SEEDS = [11, 29, 47, 83];
function tear(seed: number) {
  let s = seed;
  const r = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const ys: number[] = [];
  let y = 18;
  for (let i = 0; i <= N; i++) {
    y = Math.max(2, Math.min(40, y + (r() - 0.5) * 40 * (i % 9 === 0 ? 0.9 : 0.42)));
    ys.push(y);
  }
  return ys;
}
const poly = (ys: number[], add: (i: number) => number = () => 0) =>
  `0,${H} ${ys.map((y, i) => `${((i / N) * W).toFixed(1)},${(y + add(i)).toFixed(1)}`).join(" ")} ${W},${H}`;

/* ── textures, generated once ─────────────────────────────────────────────────────────────────────────────── */
// Tileable gradient (Perlin) noise: the lattice wraps at `period` cells across the texture; each octave doubles
// the period (and halves the amplitude) so the sum stays tileable.
function perlinTex(size: number, basePeriod: number, octaves: number) {
  let s = 1234567;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const grads = new Float32Array(512 * 2);
  for (let i = 0; i < 512; i++) {
    const a = rnd() * Math.PI * 2;
    grads[i * 2] = Math.cos(a);
    grads[i * 2 + 1] = Math.sin(a);
  }
  const perm = Array.from({ length: 512 }, (_, i) => i);
  for (let i = 511; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  const out = new Float32Array(size * size);
  let amp = 1,
    period = basePeriod,
    total = 0;
  for (let o = 0; o < octaves; o++) {
    const g = (ix: number, iy: number, dx: number, dy: number) => {
      const x = ((ix % period) + period) % period,
        y = ((iy % period) + period) % period;
      const h = perm[(perm[(x + o * 61) & 511] + y) & 511] * 2;
      return grads[h] * dx + grads[h + 1] * dy;
    };
    for (let py = 0; py < size; py++)
      for (let px = 0; px < size; px++) {
        const x = (px / size) * period,
          y = (py / size) * period;
        const x0 = Math.floor(x),
          y0 = Math.floor(y);
        const fx = x - x0,
          fy = y - y0;
        const u = fade(fx),
          v = fade(fy);
        const n00 = g(x0, y0, fx, fy),
          n10 = g(x0 + 1, y0, fx - 1, fy);
        const n01 = g(x0, y0 + 1, fx, fy - 1),
          n11 = g(x0 + 1, y0 + 1, fx - 1, fy - 1);
        const a = n00 + u * (n10 - n00),
          b = n01 + u * (n11 - n01);
        out[py * size + px] += amp * (a + v * (b - a));
      }
    total += amp;
    amp *= 0.5;
    period *= 2;
  }
  const bytes = new Uint8Array(size * size);
  for (let i = 0; i < out.length; i++) bytes[i] = Math.max(0, Math.min(255, Math.round((out[i] / total / 0.7 + 0.5) * 255)));
  return bytes;
}

// Crumpled-paper / dried-mud grain: periodic value noise at 16–128 + 20% white noise, contrast pow 0.8.
function grainTex(size: number) {
  let s = 7654321;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const out = new Float32Array(size * size);
  const layers: [number, number][] = [
    [16, 0.15],
    [32, 0.25],
    [64, 0.35],
    [128, 0.25],
  ];
  for (const [period, w] of layers) {
    const lat = Float32Array.from({ length: period * period }, rnd);
    const at = (x: number, y: number) => lat[(((y % period) + period) % period) * period + (((x % period) + period) % period)];
    for (let py = 0; py < size; py++)
      for (let px = 0; px < size; px++) {
        const x = (px / size) * period,
          y = (py / size) * period;
        const x0 = Math.floor(x),
          y0 = Math.floor(y);
        const fx = x - x0,
          fy = y - y0;
        const u = fx * fx * (3 - 2 * fx),
          v = fy * fy * (3 - 2 * fy);
        const a = at(x0, y0) + u * (at(x0 + 1, y0) - at(x0, y0));
        const b = at(x0, y0 + 1) + u * (at(x0 + 1, y0 + 1) - at(x0, y0 + 1));
        out[py * size + px] += w * (a + v * (b - a));
      }
  }
  let lo = Infinity,
    hi = -Infinity;
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.pow(Math.max(0, out[i] * 0.8 + rnd() * 0.2), 0.8);
    if (out[i] < lo) lo = out[i];
    if (out[i] > hi) hi = out[i];
  }
  const bytes = new Uint8Array(size * size);
  for (let i = 0; i < out.length; i++) bytes[i] = Math.round(((out[i] - lo) / (hi - lo)) * 255);
  return bytes;
}

/* ── shaders ──────────────────────────────────────────────────────────────────────────────────────────────── */
const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uNoise;
uniform sampler2D uGrain;
uniform vec2  uBandPx;
uniform float uVh;
uniform float uVw;
uniform float uDpr;
uniform float uTime;
uniform float uScroll;
uniform float uSeed;
uniform float uScale;                      // 1 on desktop; phones use a smaller tear
uniform vec3  uColor;
out vec4 outColor;

float noise(vec2 p) { return texture(uNoise, p).r * 2.0 - 1.0; }

void main() {
  vec2 px = gl_FragCoord.xy / uDpr;          // CSS px, y = 0 at the boundary
  vec2 q  = px / uVh;                        // viewport-height units
  float xN = px.x / uBandPx.x;

  // big slow tear shape: low-frequency fBm, drifting with time and scroll
  vec2 nUv = vec2(q.x, q.y + uTime * 0.02 + uScroll * 0.12 + uSeed) * 0.375 - uTime * 0.00625;
  float shape = noise(nUv);

  // the tear bulges up around 40% of the width
  float lean = smoothstep(0.6, -0.4, abs(xN - 0.4));

  // per-pixel grain: the glitter
  float g = texture(uGrain, px / (uVw * 0.5) + uSeed).r - 0.5;
  float grainAmp = mix(0.3, 0.6, 0.5 + 0.5 * sin(uTime - xN * 10.0));
  float grain = g * grainAmp * 0.042;

  const float uLift = 0.12;                  // keeps the DOM boundary always covered
  float edge = uScale * (uLift + shape * 0.09 + lean * 0.05) - q.y + grain;

  float aa = fwidth(edge) * 10.0;
  float alpha = smoothstep(-aa, aa, edge);

  // bright rim right at the threshold, with a sparkle wave travelling sideways
  float rim = 1.0 - smoothstep(0.0, 0.005, abs(edge));
  float boost = mix(2.0, 4.0, 0.5 + 0.5 * sin(uTime + xN * 10.0));
  vec3 col = min(uColor * mix(1.0, boost, rim), vec3(1.0));

  outColor = vec4(col * alpha, alpha);       // premultiplied
}`;

/* ── shared renderer ──────────────────────────────────────────────────────────────────────────────────────── */
type Band = {
  el: HTMLDivElement;
  cv: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  seed: number;
  live: boolean;
  w: number; // device px
  h: number;
  cssW: number;
  cssH: number;
  dpr: number;
};
type Renderer = {
  gl: WebGL2RenderingContext;
  canvas: HTMLCanvasElement;
  u: Record<string, WebGLUniformLocation | null>;
  color: [number, number, number];
};

let R: Renderer | null | false = null; // null: not tried yet; false: unavailable, use the static polygon
const bands = new Set<Band>();
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
let raf = 0,
  t0 = 0,
  scrollS = -1;

function parchment(): [number, number, number] {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--parchment").trim() || "#e8e5dd";
  const m = /^#?([0-9a-f]{6})$/i.exec(v);
  if (!m) return [0.91, 0.898, 0.867];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function renderer(): Renderer | false {
  if (R !== null) return R;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
    if (!gl) return (R = false);
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) throw new Error("shader");
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? "link");
    gl.useProgram(prog);
    gl.bindVertexArray(gl.createVertexArray());

    const tex = (unit: number, size: number, data: Uint8Array) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, size, size, 0, gl.RED, gl.UNSIGNED_BYTE, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };
    tex(0, 256, perlinTex(256, 8, 4));
    tex(1, 512, grainTex(512));

    const u: Renderer["u"] = {};
    for (const n of ["uNoise", "uGrain", "uBandPx", "uVh", "uVw", "uDpr", "uTime", "uScroll", "uSeed", "uScale", "uColor"]) u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(u.uNoise, 0);
    gl.uniform1i(u.uGrain, 1);
    gl.clearColor(0, 0, 0, 0);
    gl.disable(gl.BLEND);

    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      R = false;
      bands.forEach((b) => b.el.classList.remove("has-gl"));
    });
    return (R = { gl, canvas, u, color: parchment() });
  } catch {
    return (R = false);
  }
}

function measure(b: Band) {
  b.dpr = innerWidth < 768 ? 1 : Math.min(devicePixelRatio || 1, 1.5);
  b.cssW = b.el.clientWidth;
  b.cssH = b.el.clientHeight;
  b.w = Math.max(1, Math.round(b.cssW * b.dpr));
  b.h = Math.max(1, Math.round(b.cssH * b.dpr));
  if (b.cv.width !== b.w || b.cv.height !== b.h) {
    b.cv.width = b.w;
    b.cv.height = b.h;
  }
}

function draw(r: Renderer, b: Band, time: number, scroll: number) {
  const { gl, canvas, u } = r;
  if (canvas.width < b.w || canvas.height < b.h) {
    canvas.width = Math.max(canvas.width, b.w);
    canvas.height = Math.max(canvas.height, b.h);
  }
  gl.viewport(0, 0, b.w, b.h);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform2f(u.uBandPx, b.cssW, b.cssH);
  gl.uniform1f(u.uVh, innerHeight);
  gl.uniform1f(u.uVw, innerWidth);
  gl.uniform1f(u.uDpr, b.dpr);
  gl.uniform1f(u.uTime, time);
  gl.uniform1f(u.uScroll, scroll);
  gl.uniform1f(u.uSeed, b.seed);
  gl.uniform1f(u.uScale, innerWidth < 768 ? 0.5 : 1);
  gl.uniform3f(u.uColor, r.color[0], r.color[1], r.color[2]);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  // the band was drawn into the bottom-left of the shared canvas: copy that region into the band
  b.ctx.clearRect(0, 0, b.w, b.h);
  b.ctx.drawImage(canvas, 0, canvas.height - b.h, b.w, b.h, 0, 0, b.w, b.h);
  if (!b.el.classList.contains("has-gl")) b.el.classList.add("has-gl");
}

function frame(now: number) {
  raf = 0;
  const r = R;
  if (!r) return;
  const target = scrollY / innerHeight;
  scrollS = scrollS < 0 ? target : scrollS + (target - scrollS) * 0.15; // the morph lags a little behind flicks
  const time = (now - t0) / 1000;
  let any = false;
  for (const b of bands) {
    if (!b.live) continue;
    any = true;
    draw(r, b, time, scrollS);
  }
  if (any) raf = requestAnimationFrame(frame);
}
function wake() {
  if (!t0) t0 = performance.now();
  if (!raf) raf = requestAnimationFrame(frame);
}

/* ── component ────────────────────────────────────────────────────────────────────────────────────────────── */
export function TornEdge({ variant = 0, seed, position = "bottom" }: { variant?: number; seed?: number; position?: "bottom" | "top" }) {
  const sd = seed ?? SEEDS[variant % SEEDS.length];
  const ys = tear(sd);
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current,
      c = cv.current;
    if (!el || !c) return;
    const r = renderer();
    const ctx = c.getContext("2d");
    if (!r || !ctx) return; // the static polygon stays
    const b: Band = { el, cv: c, ctx, seed: (sd % 97) / 97, live: false, w: 1, h: 1, cssW: 1, cssH: 1, dpr: 1 };
    bands.add(b);
    const once = () => {
      measure(b);
      if (R) draw(R, b, 0, scrollY / innerHeight);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        b.live = e.isIntersecting && !still();
        if (!e.isIntersecting) return;
        measure(b);
        if (still()) once();
        else wake();
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    const ro = new ResizeObserver(() => {
      measure(b);
      if (still() && R) once();
    });
    ro.observe(el);
    return () => {
      bands.delete(b);
      io.disconnect();
      ro.disconnect();
    };
  }, [sd]);

  return (
    <div className={`torn torn--${position}`} ref={wrap} aria-hidden="true">
      <svg className="torn__svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <polygon points={poly(ys)} className="torn__fiber" />
        <polygon points={poly(ys, (i) => 4 + ((i * 7) % 5))} className="torn__paper" />
      </svg>
      <canvas className="torn__gl" ref={cv} />
    </div>
  );
}
