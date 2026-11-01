"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { TEAM } from "@/lib/team";
import { sound } from "@/lib/sound";

type Member = (typeof TEAM)[number];
const TILT: Record<string, number> = { ceo: -3, cto: 3 };
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DUR = 600;
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

// The transform that makes the detail card sit exactly where (and as tilted as) the playing card is.
function fromRect(card: DOMRect, detail: DOMRect, tilt: number) {
  const dx = card.left + card.width / 2 - (detail.left + detail.width / 2);
  const dy = card.top + card.height / 2 - (detail.top + detail.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${card.width / detail.width}, ${card.height / detail.height}) rotate(${tilt}deg)`;
}

// Leadership as playing cards (after the WebGrow360 media site's About page). Clicking a card morphs it, un-tilting
// as it travels, into a detail card that takes the place of the introduction: bio, responsibilities, skills and a
// quote, staggered in. Clicking the detail (or Escape) morphs it back into its card. A FLIP animation on the Web
// Animations API stands in for a shared-layout library; reduced motion gets a plain cross-fade.
export function LeaderCards({ intro }: { intro: React.ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const cards = useRef<Record<string, HTMLDivElement | null>>({});
  const detail = useRef<HTMLElement>(null);
  const left = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const from = useRef<DOMRect | null>(null);
  const busy = useRef(false);
  const refocus = useRef<string | null>(null);
  const m = TEAM.find((t) => t.id === active) as Member | undefined;

  const open = (id: string) => {
    if (busy.current) return;
    const el = cards.current[id];
    from.current = el ? el.getBoundingClientRect() : null;
    sound.open();
    setActive(id);
  };

  // morph in: the detail starts on top of the card it came from
  useLayoutEffect(() => {
    const d = detail.current;
    if (!m || !d) return;
    const r = d.getBoundingClientRect();
    if (from.current && !still()) {
      busy.current = true;
      const a = d.animate([{ transform: fromRect(from.current, r, TILT[m.id] ?? 0) }, { transform: "none" }], { duration: DUR, easing: EASE });
      d.querySelector(".lc-detail__face")?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: DUR, easing: "linear", fill: "forwards" });
      a.onfinish = () => (busy.current = false);
    }
    d.classList.add("is-in");
    back.current?.focus({ preventScroll: true });
    // on narrow screens the detail opens above the cards: bring it into view
    if (innerWidth < 1024 && left.current) {
      const top = left.current.getBoundingClientRect().top + scrollY - 90;
      if (Math.abs(scrollY - top) > 40) {
        const lenis = (window as unknown as { __lenis?: { scrollTo(y: number, o?: object): void } }).__lenis;
        if (lenis) lenis.scrollTo(top, { duration: 0.8 });
        else scrollTo({ top, behavior: still() ? "auto" : "smooth" });
      }
    }
  }, [m]);

  const close = useCallback(() => {
    const d = detail.current;
    const id = active;
    if (!d || !id || busy.current) return;
    const done = () => {
      busy.current = false;
      refocus.current = id;
      setActive(null);
    };
    const card = cards.current[id];
    if (!card || still()) return done();
    busy.current = true;
    d.classList.remove("is-in");
    const to = fromRect(card.getBoundingClientRect(), d.getBoundingClientRect(), TILT[id] ?? 0);
    d.querySelector(".lc-detail__face")?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DUR * 0.6, delay: DUR * 0.25, easing: "linear", fill: "forwards" });
    d.animate([{ transform: "none" }, { transform: to }], { duration: DUR, easing: EASE, fill: "forwards" }).onfinish = done;
  }, [active]);

  // once the card is back (visible again), keyboard focus returns to it
  useEffect(() => {
    if (active || !refocus.current) return;
    cards.current[refocus.current]?.querySelector<HTMLButtonElement>(".lc-card__hit")?.focus({ preventScroll: true });
    refocus.current = null;
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [active, close]);

  return (
    <div className="lc">
      <div className="lc__left" ref={left}>
        <div className={`lc__intro${active ? " is-hidden" : ""}`} aria-hidden={active ? true : undefined}>
          {intro}
          <p className="lc__hint">
            <span className="lc__dot" aria-hidden="true" />
            Click a card<span className="lc__wide"> on the right</span> to see the person behind it ↗
          </p>
        </div>
        {m && (
          <article
            ref={detail}
            id="lc-detail"
            className="lc-detail"
            aria-label={`${m.name}, ${m.title}`}
            onClick={(e) => {
              if ((e.target as Element).closest("a")) return;
              close();
            }}
          >
            <div className="lc-detail__face" aria-hidden="true">
              <Image src={m.photo} alt="" fill sizes="300px" />
            </div>
            <div className="lc-detail__in">
              <div className="lc-detail__head" style={{ "--i": 0 } as React.CSSProperties}>
                <Image src={m.photo} alt="" width={44} height={44} />
                <span>{m.title}</span>
              </div>
              <h3 className="lc-detail__name" style={{ "--i": 1 } as React.CSSProperties}>
                {m.name}
              </h3>
              <p className="lc-detail__bio" style={{ "--i": 2 } as React.CSSProperties}>
                {m.bio}
              </p>
              <p className="lc-detail__label" style={{ "--i": 3 } as React.CSSProperties}>
                Core responsibilities &amp; capabilities
              </p>
              <ul className="lc-detail__list">
                {m.responsibilities.map((r, i) => (
                  <li key={r} style={{ "--i": 4 + i } as React.CSSProperties}>
                    <span aria-hidden="true">✓</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="lc-detail__chips" style={{ "--i": 8 } as React.CSSProperties}>
                {m.chips.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <blockquote className="lc-detail__quote" style={{ "--i": 9 } as React.CSSProperties}>
                “{m.quote}”
              </blockquote>
              <div className="lc-detail__foot" style={{ "--i": 10 } as React.CSSProperties}>
                <span>AI.WEBGROW360.ONLINE</span>
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer">
                    <LinkedInIcon /> LinkedIn
                  </a>
                )}
                <button
                  ref={back}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    close();
                  }}
                >
                  Click to flip back ↺
                </button>
              </div>
            </div>
          </article>
        )}
      </div>

      <div className="lc__panel" aria-label="Leadership cards">
        {TEAM.map((t) => (
          <div
            key={t.id}
            ref={(el) => {
              cards.current[t.id] = el;
            }}
            className={`lc-card${t.id === active ? " is-away" : ""}`}
            style={{ "--tilt": `${TILT[t.id] ?? 0}deg` } as React.CSSProperties}
          >
            <button
              type="button"
              className="lc-card__hit"
              aria-expanded={t.id === active}
              aria-controls="lc-detail"
              aria-label={`Open ${t.name}, ${t.title}`}
              onClick={() => open(t.id)}
            />
            <Image src={t.photo} alt="" fill sizes="(max-width: 767px) 45vw, 270px" />
            <span className="lc-card__shade" aria-hidden="true" />
            <div className="lc-card__body">
              <b className="lc-card__role">{t.role}</b>
              <small className="lc-card__sub">{t.subtitle}</small>
              <span className="lc-card__pill" aria-hidden="true">
                Rotate →
              </span>
              {t.linkedin && (
                <a className="lc-card__pill lc-card__pill--in" href={t.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${t.name} on LinkedIn`}>
                  <LinkedInIcon /> LinkedIn
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
