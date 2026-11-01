"use client";

import { useEffect, useRef, useState } from "react";
import { onScroll, pinProgress, progress, reducedMotion } from "@/lib/scroll";
import { BLOCKS, pick } from "@/lib/glyph";

const PHRASES = [
  "WEBGROW360 .AI",
  "AGENTS",
  "AUTOMATION",
  "DATA",
  "LANGUAGE",
  "BUILT IN KOLKATA FOR EVERYWHERE",
  "AI THAT DOES THE WORK",
];
// Words the dissolve band spells in its data noise, all taken from the site.
const STREAM = "AGENT ETL RAG PIPELINE INVOICE TRACE 2.4 s OK 200 ";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const CELL = 8;

type Ring = { r: number; fs: number; text: string; len: number; dur: number; rev: boolean; op: number };

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => v * v * (3 - 2 * v);

// Concentric rings of type around a centre disc. Radii and font sizes grow outward so the rings read as depth.
function layout(w: number, h: number): { rings: Ring[]; discR: number } {
  const phone = w < 768;
  const vmin = Math.min(w, h);
  const discR = (phone ? 0.4 : 0.23) * vmin;
  const n = phone ? 4 : 8;
  const rings: Ring[] = [];
  let r = discR + 26;
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    const fs = 11 + (phone ? 12 : 17) * k;
    if (i > 0) r += fs * 1.25 + 12;
    const phrase = PHRASES[i % PHRASES.length];
    const unit = `${phrase} · `;
    const C = 2 * Math.PI * r;
    const reps = Math.max(1, Math.round(C / (unit.length * fs * 0.66)));
    rings.push({ r, fs, text: unit.repeat(reps), len: C, dur: 40 + 80 * k, rev: i % 2 === 1, op: 0.7 - 0.45 * k });
  }
  return { rings, discR };
}

export function FooterOrbit({ voice, email }: { voice: string; email: string }) {
  const stage = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; rings: Ring[]; discR: number } | null>(null);

  // Geometry follows the pinned viewport.
  useEffect(() => {
    const measure = () => {
      const w = innerWidth,
        h = innerHeight;
      setGeo((g) => (g && g.w === w && Math.abs(g.h - h) < 80 ? g : { w, h, ...layout(w, h) }));
    };
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, []);

  // Rotation only runs while the stage is on screen.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.classList.toggle("is-live", e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The disc grows with the scroll, the rings ease outward ahead of it, and past 70% the call to action appears.
  useEffect(() => {
    const el = stage.current;
    if (!el || !geo) return;
    const still = reducedMotion();
    const s0 = 12 / (geo.discR * 2);
    return onScroll(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const g = still ? 1 : smooth(clamp((pinProgress(el) - 0.04) / 0.62));
      if (disc.current) disc.current.style.transform = `translate(-50%, -50%) scale(${(s0 + (1 - s0) * g).toFixed(4)})`;
      if (svg.current) svg.current.style.transform = `scale(${(1 + 0.15 * g).toFixed(4)})`;
      cta.current?.classList.toggle("is-open", g > 0.7);
    });
  }, [geo]);

  // Flicker: every 2–4 s each ring swaps ~2% of its letters for block glyphs for 80 ms.
  useEffect(() => {
    if (!geo || reducedMotion()) return;
    const paths = Array.from(svg.current?.querySelectorAll<SVGTextPathElement>("textPath") ?? []);
    const timers: number[] = [];
    paths.forEach((tp, i) => {
      const base = geo.rings[i].text;
      const slots = [...base].map((c, j) => (c === " " || c === "·" ? -1 : j)).filter((j) => j >= 0);
      const tick = () => {
        if (stage.current?.classList.contains("is-live")) {
          const chars = [...base];
          const count = Math.max(1, Math.floor(slots.length * 0.02));
          for (let k = 0; k < count; k++) chars[slots[(Math.random() * slots.length) | 0]] = pick(BLOCKS);
          tp.textContent = chars.join("");
          timers.push(window.setTimeout(() => (tp.textContent = base), 80));
        }
        timers[i] = window.setTimeout(tick, 2000 + Math.random() * 2000);
      };
      timers[i] = window.setTimeout(tick, 600 + Math.random() * 2400);
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [geo]);

  // The dissolve band: an 8 px cell grid where the dark stage breaks up into dithered data as you scroll.
  useEffect(() => {
    const host = band.current,
      cv = canvas.current;
    if (!host || !cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const col = (v: string, f: string) => css.getPropertyValue(v).trim() || f;
    const NIGHT = col("--night", "#0b0f1a"),
      PARCH = col("--parchment", "#e8e5dd"),
      FAINT = col("--ink-faint", "#a19d94");
    const font = css.getPropertyValue("--font-mono").trim() || "monospace";
    let cols = 0,
      rows = 0,
      noise = new Float32Array(0),
      roll = new Float32Array(0),
      offs: number[] = [];
    let dpr = 1;
    let dirty = true,
      raf = 0,
      last = 0,
      lastShuffle = 0,
      visible = false,
      shift = 0;

    const size = () => {
      dpr = Math.min(2, devicePixelRatio || 1);
      const w = host.clientWidth,
        h = host.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cols = Math.ceil(w / CELL);
      rows = Math.ceil(h / CELL);
      noise = new Float32Array(cols * rows).map(() => Math.random());
      roll = new Float32Array(cols * rows).map(() => Math.random());
      offs = Array.from({ length: rows }, () => (Math.random() * STREAM.length) | 0);
      dirty = true;
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cols * CELL, rows * CELL);
      ctx.font = `500 7px ${font}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let y = 0; y < rows; y++) {
        const v = rows === 1 ? 0 : y / (rows - 1);
        const p = 1 - clamp(v * 1.05 + shift);
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          const t = (BAYER[(y & 3) * 4 + (x & 3)] / 16) * 0.72 + noise[i] * 0.28;
          const dark = y === 0 ? p > t * 0.4 : p > t;
          const edge = p > 0.08 && p < 0.92;
          const ch = STREAM[(x + offs[y]) % STREAM.length];
          if (dark) {
            // a "dark" cell is a hole onto the stage behind; some carry a parchment character
            if (edge && roll[i] < 0.3 && ch !== " ") {
              ctx.fillStyle = NIGHT;
              ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
              ctx.fillStyle = PARCH;
              ctx.fillText(ch, x * CELL + CELL / 2, y * CELL + CELL / 2 + 0.5);
            }
          } else {
            ctx.fillStyle = PARCH;
            ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
            if (edge && roll[i] < 0.1 && ch !== " ") {
              ctx.fillStyle = FAINT;
              ctx.fillText(ch, x * CELL + CELL / 2, y * CELL + CELL / 2 + 0.5);
            }
          }
        }
      }
      dirty = false;
    };

    size();
    const still = reducedMotion();
    if (still) {
      draw();
      return;
    }
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || now - last < 33) return; // 30 fps cap
      last = now;
      if (now - lastShuffle > 120) {
        lastShuffle = now;
        const n = Math.max(1, (noise.length * 0.02) | 0);
        for (let k = 0; k < n; k++) {
          const i = (Math.random() * noise.length) | 0;
          noise[i] = Math.random();
          roll[i] = Math.random();
        }
        dirty = true;
      }
      if (dirty) draw();
    };
    const offScroll = onScroll(() => {
      const s = (progress(host) - 0.5) * 0.7;
      if (Math.abs(s - shift) > 0.002) {
        shift = Math.max(-0.35, Math.min(0.35, s));
        dirty = true;
      }
    });
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) dirty = true;
    });
    io.observe(host);
    const ro = new ResizeObserver(size);
    ro.observe(host);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      offScroll();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <section className="orbit" ref={stage} data-theme="dark" aria-label="Write to us">
        <div className="orbit__pin">
          <div className="orbit__dots" aria-hidden="true" />
          <div className="orbit__grain" aria-hidden="true" />
          <svg
            ref={svg}
            className="orbit__rings"
            aria-hidden="true"
            viewBox={geo ? `${-geo.w / 2} ${-geo.h / 2} ${geo.w} ${geo.h}` : "-500 -500 1000 1000"}
            preserveAspectRatio="xMidYMid slice"
          >
            {geo?.rings.map((ring, i) => (
              <g
                key={`${geo.w}-${i}`}
                className="ring"
                style={{ "--dur": `${ring.dur}s`, animationDirection: ring.rev ? "reverse" : "normal", opacity: ring.op } as React.CSSProperties}
              >
                <path id={`orbit-ring-${i}`} d={`M 0,${-ring.r} A ${ring.r} ${ring.r} 0 1 1 0,${ring.r} A ${ring.r} ${ring.r} 0 1 1 0,${-ring.r}`} fill="none" />
                <text fontSize={ring.fs}>
                  <textPath href={`#orbit-ring-${i}`} textLength={ring.len} lengthAdjust="spacing">
                    {ring.text}
                  </textPath>
                </text>
              </g>
            ))}
          </svg>
          <div className="orbit__disc" ref={disc} aria-hidden="true" />
          <div className="orbit__cta" ref={cta}>
            <p className="orbit__voice">{voice}</p>
            <a className="split" href={`mailto:${email}?subject=${encodeURIComponent("Starting a project")}`}>
              <span>Start a</span>
              <span>Project</span>
            </a>
            <p className="orbit__status">
              <b className="dot dot--live" aria-hidden="true" />
              <span>Replying within 24h · IST UTC+5:30</span>
              <span>
                · <time data-clock>--:--:--</time>
              </span>
            </p>
          </div>
        </div>
      </section>
      <div className="dissolve" ref={band} aria-hidden="true">
        <canvas ref={canvas} />
      </div>
    </>
  );
}
