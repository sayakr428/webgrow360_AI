"use client";

import { useEffect, useRef } from "react";
import { onScroll, reducedMotion } from "@/lib/scroll";
import type { PropKind } from "@/lib/chapters";
import { BgVideo } from "./BgVideo";

// ── Starfield: ~120 twinkling points and a few pulsing four-point sparkles, drifting at 0.3× scroll ──
export function Starfield({ count = 120, className = "" }: { count?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(devicePixelRatio, 1.75);
    let W = 0,
      H = 0,
      raf = 0,
      visible = false,
      shift = 0;
    const stars = Array.from({ length: count }, () => ({ x: Math.random(), y: Math.random(), r: 0.4 + Math.random() * 1.2, p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.6 }));
    const sparks = Array.from({ length: 4 }, () => ({ x: 0.1 + Math.random() * 0.8, y: 0.1 + Math.random() * 0.7, size: 7 + Math.random() * 9, p: Math.random() * 6.28 }));
    const size = () => {
      const b = c.getBoundingClientRect();
      W = b.width;
      H = b.height;
      c.width = W * dpr;
      c.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    const off = onScroll(() => {
      const r = c.getBoundingClientRect();
      shift = -r.top * 0.3;
    });
    const still = reducedMotion();
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      const time = still ? 0 : t / 1000;
      for (const s of stars) {
        const a = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * s.s + s.p));
        ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        const y = (((s.y * H + shift * (s.r / 1.6)) % H) + H) % H;
        ctx.beginPath();
        ctx.arc(s.x * W, y, s.r, 0, 6.283);
        ctx.fill();
      }
      for (const k of sparks) {
        const pulse = 0.6 + 0.4 * Math.sin(time * 1.4 + k.p);
        const L = k.size * pulse,
          x = k.x * W,
          y = k.y * H + shift * 0.6;
        ctx.fillStyle = `rgba(255,255,255,${(0.55 + 0.45 * pulse).toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(x, y - L);
        ctx.quadraticCurveTo(x, y, x + L, y);
        ctx.quadraticCurveTo(x, y, x, y + L);
        ctx.quadraticCurveTo(x, y, x - L, y);
        ctx.quadraticCurveTo(x, y, x, y - L);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      off();
    };
  }, [count]);
  return <canvas ref={ref} className={`starfield art-only ${className}`} aria-hidden="true" />;
}

// ── Glow burst: a white light where two hands meet, with lens streaks; it ignites, then breathes ──
export function GlowBurst({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <span className={`glow art-only ${className}`} style={style} aria-hidden="true">
      <i className="glow__core" />
      <i className="glow__streak" />
      <i className="glow__streak glow__streak--v" />
      <i className="glow__streak glow__streak--d" />
    </span>
  );
}

// ── Floating prop: bobs on its own loop and tilts a little towards the pointer ──
export function FloatingProp({ kind, className = "", delay = 0 }: { kind: PropKind; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      el.style.setProperty("--rx", `${(-dy * 12).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(dx * 12).toFixed(2)}deg`);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, []);
  return (
    <span ref={ref} className={`prop prop--${kind} ${className}`} style={{ animationDelay: `${-delay}s`, animationDuration: `${5 + (delay % 3)}s` }} aria-hidden="true">
      <span className="prop__body">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/props/${kind}.webp`} alt="" loading="lazy" decoding="async" />
      </span>
      <span className="prop__shadow" />
    </span>
  );
}

// ── The anachronistic object composited into each painting ──
export function StageObject({ kind, video }: { kind: string; video?: { src: string; poster: string } }) {
  if (kind === "bubble")
    return (
      <div className="obj obj--bubble art-float" aria-hidden="true">
        <span className="obj__bubble">
          <i />
          <i />
          <i />
        </span>
        <span className="obj__bubble obj__bubble--reply">Card expired on INV-8812. Update link drafted.</span>
      </div>
    );
  if (kind === "doves")
    return (
      <div className="obj obj--doves" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} className="dove" src={`/props/dove-${i + 1}.webp`} alt="" loading="lazy" style={{ "--i": i } as React.CSSProperties} />
        ))}
      </div>
    );
  if (kind === "streams")
    return (
      <svg className="obj obj--streams" viewBox="0 0 600 700" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${60 + i * 20},680 C${520 - i * 30},${560 - i * 20} ${40 + i * 25},${430 - i * 15} ${480 - i * 20},${300 - i * 10} S${120 + i * 30},${120} ${300 + i * 15},${10}`}
            className="stream"
            style={{ animationDelay: `${i * -0.8}s` }}
          />
        ))}
      </svg>
    );
  if (kind === "book")
    return (
      <div className="obj obj--book art-float" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="book" src="/props/book.webp" alt="" loading="lazy" />
        {["Policy §4.2", "Yes, if in the SOW", "Cited: 2 sources"].map((t, i) => (
          <span key={t} className="book__bubble" style={{ "--i": i } as React.CSSProperties}>
            {t}
          </span>
        ))}
      </div>
    );
  if (kind === "laptop")
    return (
      <div className="obj obj--laptop art-float" aria-hidden="true">
        <div className="laptop">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="laptop__img" src="/props/laptop.webp" alt="" loading="lazy" />
          <div className="laptop__screen">{video && <BgVideo src={video.src} poster={video.poster} className="laptop__video" />}</div>
        </div>
      </div>
    );
  return (
    <div className="obj obj--chart art-float" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/props/chart.webp" alt="" loading="lazy" />
    </div>
  );
}
