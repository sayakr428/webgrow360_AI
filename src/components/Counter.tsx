"use client";

import { useEffect, useRef, useState } from "react";

// The final value is what the server renders, so crawlers and no-JS readers see real numbers.
// Numeric stats count up once (ease-out, 1.2 s) when they come into view; a year never counts, it mask-reveals in
// place. Whichever fires first, the observer or a scroll/timeout sweep, starts it, so a stat never stays partial.
export function StatCounter({ value, suffix = "", kind = "count" }: { value: number; suffix?: string; kind?: "count" | "year" }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) return; // already visible on load: keep the final value
    setArmed(true);
    const from = Math.round(value * 0.6);
    if (kind === "count") setN(from);
    let raf = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      cleanup();
      el.classList.add("is-shown");
      if (kind !== "count") return;
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / 1200);
        setN(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([e]) => e.isIntersecting && start(), { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    const sweep = () => {
      const b = el.getBoundingClientRect();
      if (b.top < innerHeight && b.bottom > 0) start();
    };
    addEventListener("scroll", sweep, { passive: true });
    const t = window.setTimeout(sweep, 2500);
    function cleanup() {
      io.disconnect();
      removeEventListener("scroll", sweep);
      window.clearTimeout(t);
    }
    return () => {
      cleanup();
      cancelAnimationFrame(raf);
    };
  }, [value, kind]);

  return (
    <span ref={ref} className={`stat${kind === "year" ? " stat--year" : ""}${armed ? " is-armed" : ""}`}>
      {kind === "year" ? value : n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
