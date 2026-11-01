"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { sound } from "@/lib/sound";

type Ctx = {
  soundOn: boolean;
  soul: boolean;
  toggleSound: () => void;
  toggleSoul: () => void;
};

const ExperienceContext = createContext<Ctx>({ soundOn: false, soul: true, toggleSound: () => {}, toggleSoul: () => {} });
export const useExperience = () => useContext(ExperienceContext);

const INTERACTIVE = "a, button, summary, [data-sfx], input[type=range]";
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

// Sound: an ambient choir bed plus interface sounds, muted until asked for.
// Soul: "art mode" (grain, glow, particles) against a plain, calmer page. Both persist.
export function Experience({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(false);
  const [soul, setSoul] = useState(true);
  const soundRef = useRef(false);

  useEffect(() => {
    if (store.get("w360-soul") === "off") setSoul(false);
    if (store.get("w360-sound") === "on") {
      // Browsers need a gesture before audio, so a remembered "on" starts on the first interaction.
      soundRef.current = true;
      setSoundOn(true);
      const arm = () => {
        sound.setEnabled(true);
        sound.startAmbient();
      };
      addEventListener("pointerdown", arm, { once: true });
      addEventListener("keydown", arm, { once: true });
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.art = soul ? "on" : "off";
  }, [soul]);

  const toggleSound = useCallback(() => {
    const next = !soundRef.current;
    soundRef.current = next;
    setSoundOn(next);
    sound.setEnabled(true);
    sound.toggle(next);
    if (next) sound.startAmbient();
    else {
      sound.stopAmbient();
      window.setTimeout(() => !soundRef.current && sound.setEnabled(false), 300);
    }
    store.set("w360-sound", next ? "on" : "off");
  }, []);

  const toggleSoul = useCallback(() => {
    setSoul((on) => {
      store.set("w360-soul", on ? "off" : "on");
      sound.toggle(!on);
      return !on;
    });
  }, []);

  // Hover and press sounds on every control.
  useEffect(() => {
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest?.(INTERACTIVE);
      if (el && el !== last) sound.hover();
      last = el;
    };
    const down = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.(INTERACTIVE);
      if (el && !el.matches("summary, input[type=range], [data-sfx=none]")) sound.click();
    };
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerdown", down);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", down);
    };
  }, []);

  // Reveals: opacity 0 → 1 and y 24 → 0, once, with a sweep so a fast jump never leaves content hidden.
  // This provider lives in the layout and mounts once, but client-side navigation (home → a service page, About…)
  // swaps the page underneath it, so new [data-reveal] elements are picked up by a MutationObserver and the sweep
  // always reads the live DOM. Without that, a page reached by a link kept every revealed block at opacity 0.
  useEffect(() => {
    const pending = () => Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)"));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      const all = () => pending().forEach((el) => el.classList.add("is-in"));
      all();
      const mo = new MutationObserver(all);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    const watched = new WeakSet<Element>();
    const watch = () => {
      for (const el of pending()) {
        if (watched.has(el)) continue;
        watched.add(el);
        io.observe(el);
      }
    };
    let timer = 0,
      safety = 0;
    const sweep = () => {
      timer = 0;
      for (const el of pending()) {
        if (el.getBoundingClientRect().top < innerHeight) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      }
    };
    const onScroll = () => {
      if (!timer) timer = window.setTimeout(sweep, 120);
    };
    // a new page (or streamed-in content) arrived: watch its reveals and give it the same safety sweep as a fresh load
    // (text-only mutations from the animated copy are ignored, and a pending safety sweep is never pushed back)
    const mo = new MutationObserver((records) => {
      if (!records.some((r) => Array.prototype.some.call(r.addedNodes, (n: Node) => n.nodeType === 1))) return;
      watch();
      if (!safety) safety = window.setTimeout(() => ((safety = 0), sweep()), 2500);
      onScroll();
    });
    watch();
    mo.observe(document.body, { childList: true, subtree: true });
    addEventListener("scroll", onScroll, { passive: true });
    safety = window.setTimeout(() => ((safety = 0), sweep()), 2500);
    return () => {
      io.disconnect();
      mo.disconnect();
      removeEventListener("scroll", onScroll);
      window.clearTimeout(safety);
      window.clearTimeout(timer);
    };
  }, []);

  // Smooth scroll (lerp 0.1) on fine pointers without reduced motion; anchor links go through it too.
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: 0 } });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return <ExperienceContext.Provider value={{ soundOn, soul, toggleSound, toggleSoul }}>{children}</ExperienceContext.Provider>;
}
