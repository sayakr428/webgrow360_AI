"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/scroll";
import { scramble } from "@/lib/glyph";

const WORD = "WebGrow360";
const AI = ".AI";
const PX = 6; // pixel pitch of the assembling squares
const EASE = (t: number) => {
  // cubic-bezier(.2,.7,0,1), close enough: a fast start that settles softly
  const u = 1 - t;
  return 1 - u * u * u * u;
};

type Sq = { tx: number; ty: number; sx: number; sy: number; delay: number };

// "WebGrow360 .AI" across the full width of the footer. Once per page view, when 30% of it is in view, each letter
// assembles from a cloud of matte squares, decodes through random glyphs into real type, takes a single scanner
// pass and settles with .AI softened and an [ONLINE] tag. Afterwards the cursor acts as a magnet lens, and a random
// letter re-scrambles every 8–12 s. The animated layers are aria-hidden; the wrapper carries the name.
export function FooterWord() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current,
      canvas = cv.current;
    if (!el || !canvas) return;
    const chars = Array.from(el.querySelectorAll<HTMLSpanElement>(".ch"));
    const finals = chars.map((c) => c.textContent ?? "");
    const timers: number[] = [];
    const cancels: (() => void)[] = [];
    let raf = 0,
      lensRaf = 0,
      visible = false,
      settled = false;
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    // Each character keeps the width of its real glyph, so scrambling through wider or narrower glyphs never moves
    // its neighbours (no layout shift). Re-measured when the footer resizes.
    const lock = () => {
      chars.forEach((c) => (c.style.width = ""));
      chars.forEach((c) => (c.style.width = `${c.getBoundingClientRect().width}px`));
    };
    const ro = new ResizeObserver(() => {
      if (el.dataset.started) lock();
    });
    ro.observe(el);

    const settle = () => {
      settled = true;
      el.classList.remove("is-wait", "is-px", "is-decode", "is-scan");
      el.classList.add("is-settled");
      heartbeat();
    };

    // idle heartbeat: one letter, 200 ms, every 8–12 s while on screen
    const heartbeat = () => {
      if (reducedMotion()) return;
      later(() => {
        if (visible) {
          const i = (Math.random() * chars.length) | 0;
          if (finals[i].trim()) cancels.push(scramble(chars[i], finals[i], 200, { keep: " " }));
        }
        heartbeat();
      }, 8000 + Math.random() * 4000);
    };

    const pixels = async () => {
      await document.fonts.ready;
      const box = el.getBoundingClientRect();
      const dpr = Math.min(2, devicePixelRatio || 1);
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return settle();
      // paint the real letters into an offscreen mask, letter by letter at their DOM positions
      const mask = document.createElement("canvas");
      mask.width = Math.ceil(box.width);
      mask.height = Math.ceil(box.height);
      const m = mask.getContext("2d", { willReadFrequently: true });
      if (!m) return settle();
      const cs = getComputedStyle(chars[0]);
      m.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      m.fillStyle = "#000";
      const asc = m.measureText("W").fontBoundingBoxAscent;
      const rects = chars.map((c) => c.getBoundingClientRect());
      const squares: Sq[] = [];
      rects.forEach((r, i) => {
        const ch = finals[i];
        if (!ch.trim()) return;
        m.clearRect(0, 0, mask.width, mask.height);
        m.fillText(ch, r.left - box.left, r.top - box.top + asc);
        const x0 = Math.max(0, Math.floor(r.left - box.left)),
          w = Math.ceil(r.width),
          h = mask.height;
        const data = m.getImageData(x0, 0, Math.max(1, w), h).data;
        for (let y = PX / 2; y < h; y += PX)
          for (let x = PX / 2; x < w; x += PX) {
            if (data[((y | 0) * w + (x | 0)) * 4 + 3] < 128) continue;
            squares.push({
              tx: x0 + x - PX / 2,
              ty: y - PX / 2,
              sx: x0 + x + (Math.random() - 0.5) * 120,
              sy: y + 80 + Math.random() * 160,
              delay: i * 50 + Math.random() * 90,
            });
          }
      });
      const ink = getComputedStyle(el).color;
      const t0 = performance.now();
      const DUR = 380;
      el.classList.add("is-px");
      const frame = (now: number) => {
        const t = now - t0;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, box.width, box.height);
        ctx.fillStyle = ink;
        let done = true;
        for (const s of squares) {
          const k = Math.min(1, Math.max(0, (t - s.delay) / DUR));
          if (k < 1) done = false;
          if (k <= 0) continue;
          const e = EASE(k);
          // dithered silhouette: every square lands one pixel short of the pitch
          ctx.fillRect(s.sx + (s.tx - s.sx) * e, s.sy + (s.ty - s.sy) * e, PX - 1, PX - 1);
        }
        if (!done) raf = requestAnimationFrame(frame);
        else decode();
      };
      raf = requestAnimationFrame(frame);
    };

    // the silhouette resolves into type, every character cycling and locking left to right
    const decode = () => {
      lock();
      el.classList.remove("is-wait", "is-px");
      el.classList.add("is-decode");
      chars.forEach((c, i) => {
        if (!finals[i].trim()) return;
        cancels.push(scramble(c, finals[i], 120 + i * 30, { keep: " " }));
      });
      later(() => {
        el.classList.add("is-scan");
        later(settle, 420);
      }, 120 + chars.length * 30 + 40);
    };

    const start = () => {
      if (reducedMotion()) {
        el.classList.remove("is-wait");
        el.classList.add("is-fade");
        return later(settle, 300);
      }
      pixels();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (e.intersectionRatio >= 0.3 && el.classList.contains("is-wait") && !el.dataset.started) {
          el.dataset.started = "1";
          start();
        }
      },
      { threshold: [0, 0.3] }
    );
    io.observe(el);

    // magnet lens on fine pointers; a tap scramble on touch
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches && !reducedMotion();
    let px = 0,
      py = 0;
    const applyLens = () => {
      lensRaf = 0;
      for (const c of chars) {
        const r = c.getBoundingClientRect();
        const dx = px - (r.left + r.width / 2),
          dy = py - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy);
        if (d < 120 && d > 0) {
          const f = (1 - d / 120) * 6;
          c.style.transform = `translate(${((dx / d) * f).toFixed(2)}px, ${((dy / d) * f).toFixed(2)}px)`;
          c.classList.add("is-lens");
        } else if (c.style.transform) {
          c.style.transform = "";
          c.classList.remove("is-lens");
        }
      }
    };
    const move = (e: PointerEvent) => {
      if (!settled) return;
      px = e.clientX;
      py = e.clientY;
      if (!lensRaf) lensRaf = requestAnimationFrame(applyLens);
    };
    const leave = () => {
      for (const c of chars) {
        c.style.transform = "";
        c.classList.remove("is-lens");
      }
    };
    const tap = (e: PointerEvent) => {
      if (e.pointerType !== "touch" || !settled || reducedMotion()) return;
      chars.forEach((c, i) => finals[i].trim() && cancels.push(scramble(c, finals[i], 320, { keep: " " })));
    };
    if (fine) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    }
    el.addEventListener("pointerdown", tap);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(lensRaf);
      timers.forEach((t) => window.clearTimeout(t));
      cancels.forEach((c) => c());
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", tap);
    };
  }, []);

  return (
    <div className="fword is-wait" ref={wrap} role="img" aria-label="WebGrow360 .AI">
      <p className="word__text" aria-hidden="true">
        <span className="word__line">
          {[...WORD].map((c, i) => (
            <span className="ch" key={i}>
              {c}
            </span>
          ))}
        </span>
        <span className="ch ch--sp">{" "}</span>
        <span className="word__line word__line--ai">
          {[...AI].map((c, i) => (
            <span className="ch ch--ai" key={i}>
              {c}
            </span>
          ))}
          <sup className="word__tag">[ONLINE]</sup>
        </span>
      </p>
      <canvas className="word__px" ref={cv} aria-hidden="true" />
      <i className="word__scan" aria-hidden="true" />
    </div>
  );
}
