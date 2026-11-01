"use client";

import { useEffect, useRef, useState } from "react";
import { SKILLS } from "@/lib/chapters";
import { SITE } from "@/lib/site";
import { reducedMotion } from "@/lib/scroll";

const SPOTS = [
  [34, 8], [58, 16], [16, 22], [76, 28], [44, 34], [10, 44], [66, 46], [28, 54],
  [80, 60], [50, 64], [14, 72], [70, 76], [36, 84], [58, 92], [20, 94], [78, 90],
];
const OPACITY = { 1: 0.35, 2: 0.65, 3: 1 } as const;

// Slash commands scattered over a parchment field, drifting slowly. Hovering one turns it into a dark token and
// nudges its neighbours away; clicking opens a small card.
export function SkillCloud() {
  const field = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    const el = field.current;
    if (!el || reducedMotion() || !matchMedia("(pointer: fine)").matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".skill"));
    const move = (e: PointerEvent) => {
      for (const it of items) {
        const r = it.getBoundingClientRect();
        const dx = r.left + r.width / 2 - e.clientX,
          dy = r.top + r.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy);
        const push = d < 160 && d > 8 ? (160 - d) / 160 : 0;
        it.style.setProperty("--px", `${((dx / (d || 1)) * push * 22).toFixed(1)}px`);
        it.style.setProperty("--py", `${((dy / (d || 1)) * push * 22).toFixed(1)}px`);
      }
    };
    const leave = () => items.forEach((it) => (it.style.setProperty("--px", "0px"), it.style.setProperty("--py", "0px")));
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  useEffect(() => {
    if (open === null) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof PointerEvent && (e.target as Element).closest(".skill, .skill-card")) return;
      setOpen(null);
    };
    addEventListener("pointerdown", close);
    addEventListener("keydown", close);
    return () => {
      removeEventListener("pointerdown", close);
      removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <ul className="skills" ref={field} aria-label="Automations we build on request">
      {SKILLS.map((s, i) => (
        <li
          key={s.t}
          className="skills__slot"
          style={{ left: `${SPOTS[i][0]}%`, top: `${SPOTS[i][1]}%`, "--o": OPACITY[s.s as 1 | 2 | 3], "--d": `${(i % 5) * -1.7}s` } as React.CSSProperties}
        >
          <button type="button" className={`skill skill--${s.s}${open === i ? " is-on" : ""}`} aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
            {s.t}
          </button>
          {open === i && (
            <div className="skill-card" role="dialog" aria-label={s.t}>
              <p>
                Walk me through <b>{s.t}</b>
              </p>
              <a href={`${SITE.booking}%20-%20${encodeURIComponent(s.t)}`}>Try it with WebGrow360 →</a>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
