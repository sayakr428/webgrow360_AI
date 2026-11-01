"use client";

import { useEffect, useRef, useState } from "react";
import { CREATION, TOUCH_MID, eraSrc } from "@/lib/chapters";
import { frame as fitFrame } from "@/lib/fit";
import { onScroll, pinProgress, reducedMotion } from "@/lib/scroll";
import { sound } from "@/lib/sound";
import { HeroRun } from "./HeroRun";
import { GlowBurst, Starfield } from "./Art";
import type { FxState } from "./HeroFx";

const IW = CREATION.w,
  IH = CREATION.h;
const DEPTH = { bg: 0.25, god: 0.75, adam: 1 };
const GLYPHS = "ABCDEFGHIKLMNOPRSTUVXYZ#%&*+=<>?";
const BEFORE = "Intell",
  AFTER = "gence";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ERAS = CREATION.eras;
const LAST = ERAS.length - 1;
const ERA_SPAN = 0.06; // pin progress each change of clothes takes
// each figure shrinks towards its own outer edge at the start, so the gap opens without pushing the bodies off-screen
const ANCHOR = { adam: { x: 0, y: 1 }, god: { x: 1, y: 0.45 } };

type Plate = { x: number; y: number; w: number; h: number };
type Layer = { tx: number; ty: number; rot: number; s: number };

// The cover. Three layers of the Creation of Adam float at different depths and follow the cursor; on load the two
// figures are far apart, and scrolling brings them together through four eras of dress (covered, the wild, the 1500s,
// the 2020s) until the fingertips touch. Contact sets off a flash, a void ringed with sparkling particles, and the
// painting turning to glowing line-art, which hands over to Chapter I.
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const plateEl = useRef<HTMLDivElement>(null);
  const lBg = useRef<HTMLImageElement>(null);
  const lGod = useRef<HTMLDivElement>(null);
  const lAdam = useRef<HTMLDivElement>(null);
  const eraLabel = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);
  const cssVoid = useRef<HTMLDivElement>(null);
  const blackout = useRef<HTMLDivElement>(null);
  const ambient = useRef<HTMLDivElement>(null);
  const stars = useRef<HTMLDivElement>(null);
  const introWord = useRef<HTMLDivElement>(null);
  const introFrame = useRef<HTMLDivElement>(null);
  const heroTitle = useRef<HTMLHeadingElement>(null);
  const heroFrame = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState({ before: BEFORE, after: AFTER });
  const [layersReady, setLayersReady] = useState(false);

  useEffect(() => {
    const sec = section.current!,
      pinEl = pin.current!,
      plate = plateEl.current!;
    const html = document.documentElement;
    const still = reducedMotion();
    const phone = matchMedia("(max-width: 767px)").matches;
    const fine = matchMedia("(pointer: fine)").matches;

    // ── plate geometry: object-fit cover, with the touch point centred on phones ──
    let P: Plate = { x: 0, y: 0, w: 1, h: 1 };
    let VW = innerWidth,
      VH = innerHeight;
    const layout = () => {
      VW = pinEl.clientWidth;
      VH = pinEl.clientHeight;
      if (phone) {
        // phones: cover would show only ~21% of this very wide painting; frame it to show 60% of its width, centred
        // on the touch, as a band below the title on a blurred copy of itself (see lib/fit)
        const b = fitFrame(VW, VH, IW / IH, TOUCH_MID.x, TOUCH_MID.y, 0.6, 0.6);
        P = { x: b.x, y: b.y, w: b.w, h: b.h };
        pinEl.classList.toggle("is-fit", b.fitted);
      } else {
        const s = Math.max(VW / IW, VH / IH) * 1.06;
        const w = IW * s,
          h = IH * s;
        P = { x: (VW - w) * 0.18, y: (VH - h) * 0.42, w, h };
      }
      const w = P.w,
        h = P.h;
      Object.assign(plate.style, { left: `${P.x}px`, top: `${P.y}px`, width: `${w}px`, height: `${h}px` });
      fx?.resize(VW, VH);
    };

    // ── state shared by the one loop ──
    const st = { nx: 0, ny: 0, tx: 0, ty: 0, p: 0, prevP: 0, armed: true, shake: -1, hover: false };
    let fx: Awaited<ReturnType<typeof import("./HeroFx").createHeroFx>> | null = null;
    let fxOk = false;
    let visible = true;

    // ── intro timeline ──
    const introOn = html.classList.contains("is-intro") && !still && scrollY <= 40 && !location.hash;
    if (!introOn) html.classList.remove("is-intro");
    let t0 = performance.now();
    let introDone = !introOn;
    const stages: [number, string][] = [
      [900, "intro-paint"],
      [1700, "intro-move"],
      [2100, "intro-head"],
      [2300, "intro-rail"],
      [2600, "intro-card"],
    ];
    let flip: { from: DOMRect; to: DOMRect; fFrom: DOMRect; fTo: DOMRect } | null = null;
    const finishIntro = () => {
      introDone = true;
      html.classList.remove("is-intro", ...stages.map((s) => s[1]));
      setTyped({ before: BEFORE, after: AFTER });
    };
    const skip = () => {
      if (introDone) return;
      const t = performance.now() - t0;
      if (t < 3000) t0 = performance.now() - 3000; // fast-forward the rest in 300ms
    };
    if (introOn) {
      setTyped({ before: "", after: "" });
      addEventListener("wheel", skip, { passive: true, once: true });
      addEventListener("pointerdown", skip, { once: true });
      addEventListener("keydown", skip, { once: true });
      addEventListener("touchmove", skip, { passive: true, once: true });
    }
    const scramble = (word: string, start: number, t: number, step: number) =>
      word
        .split("")
        .map((ch, i) => {
          const at = start + i * step;
          if (t < at) return "";
          if (t < at + 95) return GLYPHS[Math.floor(((t - at) / 35 + i * 7) % GLYPHS.length)];
          return ch;
        })
        .join("");
    let lastTyped = "";
    const introTick = (now: number) => {
      if (scrollY > 200) return finishIntro(); // the browser restored a scroll position: no intro
      const t = now - t0;
      for (const [at, cls] of stages) html.classList.toggle(cls, t >= at);
      if (t < 1400) {
        const b = scramble(BEFORE, 500, t, 70),
          a = scramble(AFTER, 560, t, 70);
        const key = b + "|" + a;
        if (key !== lastTyped) {
          lastTyped = key;
          setTyped({ before: b, after: a });
        }
      } else if (lastTyped !== "done") {
        lastTyped = "done";
        setTyped({ before: BEFORE, after: AFTER });
      }
      // FLIP the centred wordmark and frame onto the hero frame
      const w = introWord.current,
        f = introFrame.current;
      if (w && f && heroTitle.current && heroFrame.current) {
        if (t >= 1700 && !flip) {
          w.style.transform = "";
          f.style.transform = "";
          flip = { from: w.getBoundingClientRect(), to: heroTitle.current.getBoundingClientRect(), fFrom: f.getBoundingClientRect(), fTo: heroFrame.current.getBoundingClientRect() };
        }
        if (flip) {
          const k = easeIO(clamp((t - 1700) / 700));
          const tr = (a: DOMRect, b: DOMRect) =>
            `translate(${(b.left - a.left) * k}px, ${(b.top - a.top) * k}px) scale(${lerp(1, b.width / a.width, k)}, ${lerp(1, b.height / a.height, k)})`;
          w.style.transform = tr(flip.from, flip.to);
          f.style.transform = tr(flip.fFrom, flip.fTo);
        }
      }
      if (t >= 3300) finishIntro();
    };

    // ── pointer: hover parallax on fine pointers, a slow figure-eight drift on touch ──
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      st.hover = true;
      st.tx = clamp((e.clientX / innerWidth) * 2 - 1, -1, 1);
      st.ty = clamp((e.clientY / innerHeight) * 2 - 1, -1, 1);
    };
    const leave = () => {
      st.hover = false;
      st.tx = st.ty = 0;
    };
    if (fine && !still) {
      sec.addEventListener("pointermove", move);
      sec.addEventListener("pointerleave", leave);
    }
    let orient = false;
    const tilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      orient = true;
      st.tx = clamp(e.gamma / 25, -1, 1);
      st.ty = clamp((e.beta - 45) / 25, -1, 1);
    };
    if (!fine && !still) addEventListener("deviceorientation", tilt);

    // ── scroll ──
    const offScroll = onScroll(() => {});
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      plate.style.willChange = visible ? "transform" : "";
    });
    io.observe(sec);

    // ── WebGL, loaded once the intro has started ──
    const big = innerWidth > 1600;
    // the line-art takes over after contact, by which point both figures are in their last era
    const srcs = {
      bg: `${CREATION.layers.bg}${big ? "" : "-1600w"}.webp`,
      god: eraSrc("god", LAST, big),
      adam: eraSrc("adam", LAST, big),
    };
    const eraImgs = (el: HTMLElement | null) => (el ? [...el.querySelectorAll<HTMLImageElement>("img")] : []);
    const figs = { adam: eraImgs(lAdam.current), god: eraImgs(lGod.current) };
    const labels = eraLabel.current ? [...eraLabel.current.querySelectorAll<HTMLElement>("[data-era]")] : [];
    let era = 0;
    // swap the flat poster for the moving layers once the first outfit has decoded (it may finish before hydration)
    const first = figs.adam[0];
    const ready = () => {
      if (first.decode) first.decode().then(() => setLayersReady(true), () => setLayersReady(true));
      else setLayersReady(true);
    };
    if (first) {
      if (first.complete && first.naturalWidth) ready();
      else first.addEventListener("load", ready, { once: true });
    }
    let disposed = false;
    const startFx = () => {
      if (still) return;
      try {
        if (!document.createElement("canvas").getContext("webgl")) return;
      } catch {
        return;
      }
      import("./HeroFx").then(({ createHeroFx }) => {
        if (disposed) return;
        fx = createHeroFx(pinEl.querySelector(".hero__fxhost") as HTMLElement, srcs, phone);
        fx.resize(VW, VH);
        fx.loaded.then(() => (fxOk = true)).catch(() => {});
      });
    };
    const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(startFx);
    else setTimeout(startFx, 600);

    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(pinEl);

    // ── the one loop ──
    let raf = 0;
    const vw = () => VW / 100,
      vh = () => VH / 100;
    // where a point of the painting lands once its layer is scaled, rotated about the plate centre and moved
    const tip = (f: { x: number; y: number }, L: Layer) => {
      const cx = P.x + P.w / 2,
        cy = P.y + P.h / 2;
      const x = (P.x + f.x * P.w - cx) * L.s,
        y = (P.y + f.y * P.h - cy) * L.s;
      const c = Math.cos(L.rot),
        s = Math.sin(L.rot);
      return { x: cx + c * x - s * y + L.tx, y: cy + s * x + c * y + L.ty };
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!introDone) introTick(now);
      if (!visible) return;
      const time = now / 1000;

      // scroll progress, smoothed
      const target = still ? 0.45 : pinProgress(sec);
      st.p += (target - st.p) * (still ? 1 : 0.15);
      const p = st.p;

      // hover, smoothed; touch devices get a slow Lissajous drift
      if (!fine && !orient && !still) {
        st.tx = Math.sin((time * Math.PI * 2) / 14) * 0.6;
        st.ty = Math.sin((time * Math.PI * 4) / 14) * 0.4;
      }
      st.nx += (st.tx - st.nx) * 0.08;
      st.ny += (st.ty - st.ny) * 0.08;

      // choreography
      const e = easeIO(clamp(p / 0.45));
      const arc = Math.sin(Math.PI * e);
      const contact = smooth(0.4, 0.45, p);
      const recoil = smooth(0.45, 0.55, p);
      const bob = still ? 0 : 1;
      // scaling towards the anchor is a scale about the plate centre plus this shift
      const s = lerp(phone ? 0.92 : 0.87, 1, e);
      const toAnchor = (a: { x: number; y: number }) => ({ x: (1 - s) * (a.x - 0.5) * P.w, y: (1 - s) * (a.y - 0.5) * P.h });
      const aA = toAnchor(ANCHOR.adam),
        aG = toAnchor(ANCHOR.god);
      const apart = phone ? 3 : 6;
      const adam: Layer = {
        tx: aA.x + lerp(-apart * vw(), 0, e) + contact * 0.25 * vw() - recoil * 1.2 * vw() - st.nx * DEPTH.adam * 1.6 * vw(),
        ty: aA.y + lerp(2 * vh(), 0, e) - arc * 1.5 * vh() - st.ny * DEPTH.adam * 1.1 * vh() + bob * Math.sin((time * Math.PI * 2) / 2.6) * 5,
        rot: ((lerp(-2, 0, e) + bob * Math.sin((time * Math.PI * 2) / 3.4) * 0.4) * Math.PI) / 180,
        s,
      };
      const god: Layer = {
        tx: aG.x + lerp(apart * vw(), 0, e) - contact * 0.25 * vw() + recoil * 1.2 * vw() - st.nx * DEPTH.god * 1.6 * vw(),
        ty: aG.y + lerp(-2 * vh(), 0, e) + arc * 1.5 * vh() - st.ny * DEPTH.god * 1.1 * vh() + bob * Math.sin((time * Math.PI * 2) / 2.6 + 1.3) * 7,
        rot: ((lerp(1.5, 0, e) + bob * Math.sin((time * Math.PI * 2) / 3.4 + 1.3) * 0.5) * Math.PI) / 180,
        s,
      };
      const bg: Layer = { tx: -st.nx * DEPTH.bg * 1.6 * vw(), ty: -st.ny * DEPTH.bg * 1.1 * vh(), rot: 0, s: 1 };

      // eras: each new outfit dissolves in over the last one with a brief gilt shimmer; the one below hides once covered
      const k = ERAS.map((x, i) => (i === 0 ? 1 : still ? 0 : smooth(x.at - ERA_SPAN, x.at, p)));
      for (const imgs of [figs.adam, figs.god]) {
        imgs.forEach((img, i) => {
          const covered = i < LAST && k[i + 1] >= 1;
          const shimmer = i > 0 && k[i] > 0 && k[i] < 1 ? Math.sin(Math.PI * k[i]) : 0;
          img.style.opacity = covered ? "0" : k[i].toFixed(3);
          img.style.filter = shimmer ? `brightness(${(1 + 0.45 * shimmer).toFixed(3)}) sepia(${(0.55 * shimmer).toFixed(3)})` : "";
        });
      }
      const showing = k.reduce((acc, v, i) => (v >= 0.5 ? i : acc), 0);
      if (showing !== era) {
        era = showing;
        labels.forEach((l, i) => l.classList.toggle("is-on", i === era));
        if (sound.enabled) {
          sound.whoosh();
          sound.step(era / LAST);
        }
      }
      if (eraLabel.current) eraLabel.current.style.opacity = String(introDone ? smooth(0.04, 0.09, p) * (1 - smooth(0.41, 0.45, p)) : 0);

      // shake after contact: a decaying sine over 280ms
      let sx = 0;
      if (st.shake > 0) {
        const k = (now - st.shake) / 280;
        if (k < 1) sx = Math.sin(k * Math.PI * 7) * 6 * (1 - k);
        else st.shake = -1;
      }
      pinEl.style.transform = sx ? `translate3d(${sx}px, ${sx * 0.4}px, 0)` : "";

      const tiltY = st.nx * 1.2,
        tiltX = -st.ny * 0.8;
      const put = (el: HTMLElement | null, L: Layer, figure: boolean) => {
        if (el)
          el.style.transform = `translate3d(${L.tx.toFixed(2)}px, ${L.ty.toFixed(2)}px, 0) rotate(${L.rot.toFixed(5)}rad) scale(${L.s.toFixed(4)})${figure ? ` rotateY(${tiltY.toFixed(3)}deg) rotateX(${tiltX.toFixed(3)}deg)` : ""}`;
      };
      put(lBg.current, bg, false);
      put(lGod.current, god, true);
      put(lAdam.current, adam, true);
      if (stars.current) stars.current.style.transform = `translate3d(${(st.nx * 1.3 * 1.6 * vw()).toFixed(1)}px, ${(st.ny * 1.3 * 1.1 * vh()).toFixed(1)}px, 0)`;

      // the glow follows the live midpoint of the fingertips and brightens as the gap closes
      const a = tip(CREATION.touch.adam, adam),
        g = tip(CREATION.touch.god, god);
      const mid = { x: (a.x + g.x) / 2, y: (a.y + g.y) / 2 };
      const gap = Math.hypot(a.x - g.x, a.y - g.y);
      const near = clamp(1 - gap / (30 * vw()));
      if (glow.current) {
        glow.current.style.transform = `translate3d(${mid.x}px, ${mid.y}px, 0) scale(${(0.35 + near * 1.1 + contact * 0.3).toFixed(3)})`;
        glow.current.style.opacity = String(clamp(0.25 + near * 0.75) * (1 - smooth(0.5, 0.62, p)));
      }
      if (sound.enabled) sound.hum(p < 0.45 ? near * e : Math.max(0, 1 - (p - 0.45) * 12));

      // frame, title and run card leave first
      const out = still ? 0 : clamp(p / 0.12);
      if (introDone && fade.current) {
        fade.current.style.opacity = String(1 - out);
        fade.current.style.transform = `translateY(${-40 * out}px)`;
      }
      if (introDone && run.current) {
        run.current.style.opacity = String(1 - out);
        run.current.style.translate = `0 ${-40 * out}px`;
      }

      // contact: fire once crossing 45% going down; scrolling back re-arms it
      sec.style.setProperty("--touch-x", `${mid.x}px`);
      sec.style.setProperty("--touch-y", `${mid.y}px`);
      if (st.armed && st.prevP < 0.45 && p >= 0.45 && !still) {
        st.armed = false;
        st.shake = now;
        sec.classList.remove("is-impact");
        void sec.offsetWidth;
        sec.classList.add("is-impact");
        sec.dataset.impacts = String(Number(sec.dataset.impacts || 0) + 1);
        sound.impact();
        navigator.vibrate?.(25);
      }
      if (p < 0.43) st.armed = true;
      st.prevP = p;

      // the void, the line-art and the hand-off
      const vmin = Math.min(VW, VH) / 100;
      const voidR =
        p < 0.45 ? 0 : p < 0.55 ? lerp(0, 14, smooth(0.45, 0.55, p)) * vmin : p < 0.8 ? lerp(14, 75, smooth(0.55, 0.8, p)) * vmin : lerp(75, 160, smooth(0.8, 1, p)) * vmin;
      const u = smooth(0.52, 0.78, p);
      const useFx = fxOk && p > 0.44;
      if (fx) {
        fx.canvas.style.visibility = useFx ? "visible" : "hidden";
        if (useFx) fx.render({ plate: P, bg, god, adam, touch: mid, voidR, u, p, time } as FxState);
      }
      plate.style.visibility = useFx ? "hidden" : "visible";
      if (ambient.current) ambient.current.style.opacity = String(1 - smooth(0.44, 0.6, p));
      plate.style.filter = !useFx && u > 0 ? `grayscale(${u}) contrast(${1 + 1.4 * u}) brightness(${1 - 0.45 * u}) invert(${0.06 * u})` : "";
      if (cssVoid.current) {
        cssVoid.current.style.display = !useFx && voidR > 0 ? "block" : "none";
        cssVoid.current.style.setProperty("--r", `${voidR}px`);
      }
      if (blackout.current) blackout.current.style.opacity = String(smooth(0.84, 0.97, p));
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      offScroll();
      io.disconnect();
      ro.disconnect();
      sec.removeEventListener("pointermove", move);
      sec.removeEventListener("pointerleave", leave);
      removeEventListener("deviceorientation", tilt);
      removeEventListener("wheel", skip);
      removeEventListener("pointerdown", skip);
      removeEventListener("keydown", skip);
      removeEventListener("touchmove", skip);
      sound.hum(0);
      fx?.dispose();
      finishIntro();
    };
  }, []);

  return (
    <section className="hero" ref={section} data-theme="dark" aria-labelledby="hero-title">
      <div className="hero__pin" ref={pin}>
        <div className="hero__ambient" ref={ambient} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CREATION.poster} alt="" />
        </div>
        <div className="hero__plate" ref={plateEl} aria-hidden="true">
          {/* the single-image poster shows until the three layers have decoded */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={`layer layer--poster${layersReady ? " is-hidden" : ""}`} src={CREATION.poster} alt="" fetchPriority="high" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={lBg}
            className="layer layer--bg"
            src={`${CREATION.layers.bg}-1600w.webp`}
            srcSet={`${CREATION.layers.bg}-1600w.webp 1600w, ${CREATION.layers.bg}.webp 3524w`}
            sizes="(max-width: 1600px) 1600px, 3524px"
            alt=""
            fetchPriority="high"
          />
          {(["god", "adam"] as const).map((fig) => (
            <div key={fig} ref={fig === "god" ? lGod : lAdam} className={`layer layer--${fig}`}>
              {ERAS.map((era, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={era.label}
                  className="layer layer--era"
                  src={eraSrc(fig, i)}
                  srcSet={`${eraSrc(fig, i)} 1600w, ${eraSrc(fig, i, true)} 3524w`}
                  sizes="(max-width: 1600px) 1600px, 3524px"
                  alt=""
                  decoding="async"
                  loading={i === 0 ? "eager" : "lazy"}
                  style={i === 0 ? undefined : { opacity: 0 }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="hero__fxhost" aria-hidden="true" />
        <div className="stage__vignette" aria-hidden="true" />
        <div className="hero__stars" ref={stars} aria-hidden="true">
          <Starfield count={90} />
        </div>
        <div className="hero__glowpos" ref={glow} aria-hidden="true">
          <GlowBurst />
        </div>
        {/* without WebGL the hole is a CSS disc, torn up by this displacement filter */}
        <svg className="hero__svgfx" width="0" height="0" aria-hidden="true">
          <filter id="hero-void-ragged" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="4" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="110" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <div className="hero__void" ref={cssVoid} aria-hidden="true" />
        <div className="hero__flash" aria-hidden="true" />

        <div className="hero__fade" ref={fade}>
          <div className="frame" ref={heroFrame}>
            <svg className="frame__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <rect x="0.5" y="0.5" width="99" height="99" pathLength={100} vectorEffect="non-scaling-stroke" />
            </svg>
            <h1 id="hero-title" className="frame__title" ref={heroTitle} aria-label="The Intelligence Edition">
              <span aria-hidden="true">
                The
                <br />
                Intell<span className="slash">//</span>gence
                <br />
                Edition
              </span>
            </h1>
            <p className="frame__lede">AI that does the work. Six services from one team, working on your own data in 2–4 weeks.</p>
            <a className="frame__begin" href="#agents">
              Begin with Chapter I <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className="hero__era" ref={eraLabel} aria-hidden="true">
          {ERAS.map((era, i) => (
            <span key={era.label} data-era={i} className={i === 0 ? "is-on" : undefined}>
              <b>{["I", "II", "III", "IV"][i]}</b> {era.label}
            </span>
          ))}
        </div>

        <div className="hero__run glass" ref={run}>
          <HeroRun />
        </div>
        <div className="hero__blackout" ref={blackout} aria-hidden="true" />
      </div>

      {/* the load intro: black, a frame drawn in segments, the wordmark typing around its slashes */}
      <div className="boot" aria-hidden="true">
        <div className="boot__black" />
        <div className="boot__frame" ref={introFrame}>
          <svg viewBox="0 0 240 320" preserveAspectRatio="none">
            <line className="seg seg--top-l" x1="120" y1="0.5" x2="0" y2="0.5" />
            <line className="seg seg--top-r" x1="120" y1="0.5" x2="240" y2="0.5" />
            <line className="seg seg--left" x1="0.5" y1="0" x2="0.5" y2="320" />
            <line className="seg seg--right" x1="239.5" y1="0" x2="239.5" y2="320" />
            <line className="seg seg--bottom" x1="0" y1="319.5" x2="240" y2="319.5" />
          </svg>
        </div>
        <div className="boot__word" ref={introWord}>
          The
          <br />
          {typed.before}
          <span className="slash">//</span>
          {typed.after}
          <br />
          Edition
        </div>
      </div>
    </section>
  );
}

