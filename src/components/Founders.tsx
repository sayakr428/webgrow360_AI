"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { TEAM } from "@/lib/team";
import { sound } from "@/lib/sound";

// The founders hung as paintings: an oil-paint treatment, a gilt frame, a museum placard. Hovering tilts the frame
// with a glare and reveals the expertise tags; "About …" opens the full placard.
function Portrait({ m, full }: { m: (typeof TEAM)[number]; full: boolean }) {
  const frame = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const short = m.name.replace(/^(Mr\.|Er\.) /, "");
  return (
    <li className={`portrait${open ? " is-open" : ""}`}>
      <div
        className="portrait__frame"
        ref={frame}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
          const r = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5,
            y = (e.clientY - r.top) / r.height - 0.5;
          e.currentTarget.style.setProperty("--tx", `${(-y * 8).toFixed(2)}deg`);
          e.currentTarget.style.setProperty("--ty", `${(x * 10).toFixed(2)}deg`);
          e.currentTarget.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
          e.currentTarget.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty("--tx", "0deg");
          e.currentTarget.style.setProperty("--ty", "0deg");
        }}
      >
        <div className="portrait__canvas">
          <Image src={m.photo} alt={`${m.name}, ${m.title}`} fill sizes="(max-width: 768px) 80vw, 26vw" />
          <span className="portrait__glare" aria-hidden="true" />
          <div className="portrait__tags">
            {m.chips.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="placard">
        <p className="placard__role">
          {m.role} · {m.subtitle}
        </p>
        <h3 className="placard__name">{m.name}</h3>
        <p className="placard__title">{m.title}</p>
        <blockquote className="placard__quote">“{m.quote}”</blockquote>
        {open && (
          <div className="placard__more">
            <p>{m.bio}</p>
            {full && (
              <ul>
                {m.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="placard__links">
          <button
            type="button"
            className="pill pill--ghost"
            aria-expanded={open}
            onClick={() => {
              sound.open();
              setOpen((o) => !o);
            }}
          >
            {open ? "Close" : `About ${short}`}
          </button>
          {m.linkedin && (
            <a className="pill pill--ghost" href={m.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function Founders({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <filter id="oil">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
          <feComponentTransfer>
            <feFuncR type="gamma" exponent="0.95" amplitude="1.02" />
            <feFuncB type="gamma" exponent="1.08" />
          </feComponentTransfer>
        </filter>
      </svg>
      <ul className="portraits">
        {TEAM.map((m) => (
          <Portrait key={m.id} m={m} full={!compact} />
        ))}
      </ul>
    </>
  );
}
