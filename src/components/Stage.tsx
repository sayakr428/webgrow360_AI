"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Art } from "@/lib/chapters";
import { onScroll, pinProgress, reducedMotion } from "@/lib/scroll";
import { PHONE_MAX, focal, frame } from "@/lib/fit";
import { TornEdge } from "./Editorial";
import { Starfield } from "./Art";

// Beat 1 and 2 of a chapter: the painted stage, pinned for a viewport, then torn away into the parchment.
export function ChapterStage({
  id,
  art,
  word,
  subtitle,
  mood = "candle",
  object,
  card,
  tear = 0,
  tearTop = false,
  priority = false,
  as: Tag = "h2",
  short = false,
  enterFromLines = false,
  sequence,
}: {
  id: string;
  art: Art;
  sequence?: { src: string; poster: string };
  word: string;
  subtitle: string;
  mood?: string;
  object?: React.ReactNode;
  card?: React.ReactNode;
  tear?: number;
  tearTop?: boolean;
  priority?: boolean;
  as?: "h1" | "h2";
  short?: boolean;
  enterFromLines?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);
  const lines = useRef<HTMLDivElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const frameEl = useRef<HTMLDivElement>(null);

  // Phones: frame the painting so at least 58% of its width shows (see lib/fit), on a blurred ambient copy of
  // itself when it no longer fills the screen. Desktop keeps plain object-fit: cover (the frame is inset: 0).
  useEffect(() => {
    const art = img.current,
      fr = frameEl.current;
    if (!art || !fr) return;
    const pic = fr.querySelector("img");
    const [fx, fy] = focal(art.dataset.pos || "50% 50%");
    const place = () => {
      const phone = innerWidth <= PHONE_MAX;
      const ar = Number(art.dataset.ar) || (pic && pic.naturalWidth ? pic.naturalWidth / pic.naturalHeight : 0);
      if (!phone || !ar) {
        fr.removeAttribute("style");
        art.classList.remove("is-fit", "is-band");
        return;
      }
      const vw = art.clientWidth,
        vh = art.clientHeight;
      const b = frame(vw, vh, ar, fx, fy, undefined, undefined, innerHeight);
      Object.assign(fr.style, { inset: "auto", left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
      art.classList.toggle("is-fit", b.fitted);
      art.classList.toggle("is-band", b.fitted && b.h < vh - 1);
    };
    place();
    pic?.addEventListener("load", place);
    const ro = new ResizeObserver(place);
    ro.observe(art);
    return () => {
      pic?.removeEventListener("load", place);
      ro.disconnect();
    };
  }, []);

  // The sequence film follows the scroll: the painting holds for the first 12% of the pin, the film plays through to
  // 88%, and its last frame holds until the tear. Seeks are eased towards the target and never stacked, so the
  // all-keyframe encode scrubs smoothly in both directions.
  useEffect(() => {
    const el = root.current,
      v = film.current;
    if (!el || !v || reducedMotion()) return;
    let target = 0,
      shown = 0,
      raf = 0,
      ready = false;
    const onReady = () => {
      ready = true;
      el.classList.add("has-film");
    };
    if (v.readyState >= 2) onReady();
    else v.addEventListener("loadeddata", onReady, { once: true });
    // the film is heavy: only fetch it once the stage is within a couple of screens
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        v.preload = "auto";
        v.load();
      },
      { rootMargin: "200% 0px" }
    );
    near.observe(el);
    const off = onScroll(() => {
      const p = pinProgress(el);
      target = Math.min(1, Math.max(0, (p - 0.12) / 0.76));
    });
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!ready || !v.duration) return;
      shown += (target - shown) * 0.18;
      if (Math.abs(target - shown) < 0.0005) shown = target;
      const t = shown * (v.duration - 0.05);
      if (!v.seeking && Math.abs(v.currentTime - t) > 1 / 60) v.currentTime = t;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      off();
      near.disconnect();
      v.removeEventListener("loadeddata", onReady);
    };
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    if (reducedMotion()) {
      el.classList.add("is-in");
      return () => io.disconnect();
    }
    // Ken Burns tied to scroll (1.0 → 1.08) with the painting moving at 0.85× against the paper.
    const off = onScroll(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > innerHeight + 100) return;
      const p = pinProgress(el);
      const enter = Math.min(1, Math.max(0, 1 - r.top / innerHeight));
      if (enterFromLines && img.current) {
        // arriving from the hero: start as glowing line-art and resolve to colour over the first 35% of the pin
        const u = 1 - Math.min(1, p / 0.35);
        img.current.style.filter = u > 0.01 ? `grayscale(${u}) contrast(${1 + 1.4 * u}) brightness(${1 - 0.45 * u}) invert(${0.06 * u})` : "";
        if (lines.current) lines.current.style.opacity = String(u);
      }
      if (img.current) img.current.style.transform = `translate3d(0, ${((1 - enter) * -6 + p * 4).toFixed(2)}%, 0) scale(${(1 + p * 0.08).toFixed(4)})`;
    });
    return () => {
      io.disconnect();
      off();
    };
  }, [enterFromLines]);

  const words = subtitle.split(" ");
  return (
    <section
      id={id}
      ref={root}
      className={`stage stage--${mood}${short ? " stage--short" : ""}${sequence ? " stage--film" : ""}`}
      data-theme="dark"
      aria-labelledby={`${id}-word`}
    >
      {tearTop && <TornEdge variant={tear + 1} position="top" />}
      <div className="stage__pin">
        <div className="stage__art" ref={img} data-ar={sequence ? 16 / 9 : art.ar} data-pos={art.pos}>
          <div className="stage__ambient" aria-hidden="true">
            <Image src={art.src} alt="" fill sizes="100vw" style={{ objectPosition: art.pos }} />
          </div>
          <div className="stage__frame" ref={frameEl}>
            <Image src={art.src} alt={art.alt} fill priority={priority} sizes="100vw" style={{ objectPosition: art.pos }} />
            {sequence && <video ref={film} className="stage__film" src={sequence.src} poster={sequence.poster} muted playsInline preload="none" aria-hidden="true" />}
          </div>
        </div>
        <div className="stage__vignette" aria-hidden="true" />
        {enterFromLines && (
          <div className="stage__lines" ref={lines} aria-hidden="true">
            <Starfield count={90} />
          </div>
        )}
        {object}
        <div className="stage__text">
          <div className="stage__scrim" aria-hidden="true" />
          <Tag id={`${id}-word`} className="stage__word">
            <span className="mask">{word}</span>
          </Tag>
          <p className="stage__sub swash">
            <span className="swash__cap">{subtitle.charAt(0)}</span>
            {words.map((w, i) => (
              <span key={i} className="word" style={{ "--w": i } as React.CSSProperties}>
                {i === 0 ? w.slice(1) : w}{" "}
              </span>
            ))}
          </p>
        </div>
        {card && <div className="stage__card glass">{card}</div>}
      </div>
      <TornEdge variant={tear} />
    </section>
  );
}
