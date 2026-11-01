"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { INDUSTRIES } from "@/lib/services";
import { ART } from "@/lib/chapters";
import { INDUSTRY_FRAGMENTS } from "./Fragments";
import { BgVideo } from "./BgVideo";
import { SwashHeading } from "./Editorial";
import { sound } from "@/lib/sound";

const NUM = ["i", "ii", "iii", "iv", "v"];

// The School of Athens behind the block, a parchment panel floating over it. Five sectors as tabs with a sliding
// ink pill; the right side cross-fades the sentence, the case card and the sector's footage.
export function Industries() {
  const [i, setI] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const ind = INDUSTRIES[i];
  const frag = INDUSTRY_FRAGMENTS[i];

  useLayoutEffect(() => {
    const b = list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[i];
    if (!b || !pill.current) return;
    pill.current.style.transform = `translateY(${b.offsetTop}px)`;
    pill.current.style.height = `${b.offsetHeight}px`;
  }, [i]);

  const pick = (n: number) => {
    if (n === i) return;
    sound.select();
    setI(n);
  };

  return (
    <section id="industries" className="sectors" data-theme="dark" aria-labelledby="industries-h">
      <div className="sectors__art" aria-hidden="true">
        <Image src={ART.athens.src} alt="" fill sizes="100vw" style={{ objectPosition: ART.athens.pos }} />
      </div>
      <div className="sectors__panel" data-theme="light" data-reveal>
        <div className="sectors__left">
          <SwashHeading text="Sectors, served" id="industries-h" className="sec-head" />
          <p className="lede">The same agents and automations, tuned to the rules and the paperwork of each trade.</p>
          <div
            className="tabs"
            role="tablist"
            aria-label="Industries"
            aria-orientation="vertical"
            ref={list}
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const n = (i + (e.key === "ArrowDown" ? 1 : INDUSTRIES.length - 1)) % INDUSTRIES.length;
              pick(n);
              list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus();
            }}
          >
            <span className="tabs__pill" ref={pill} aria-hidden="true" />
            {INDUSTRIES.map((x, n) => (
              <button
                key={x.name}
                type="button"
                role="tab"
                id={`tab-${n}`}
                aria-selected={n === i}
                aria-controls="sector-panel"
                tabIndex={n === i ? 0 : -1}
                className={n === i ? "is-on" : ""}
                onClick={() => pick(n)}
                data-sfx="none"
              >
                <span>{x.name}</span>
                <span className="tabs__num">{NUM[n]}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="sectors__right" id="sector-panel" role="tabpanel" aria-labelledby={`tab-${i}`}>
          <p className="sectors__fact" key={`f${i}`}>
            {ind.fact}
          </p>
          <div className="sectors__media" key={`m${i}`}>
            <div className="phone">
              <BgVideo src={ind.video} poster={ind.video.replace(".mp4", ".jpg")} className="phone__video" />
            </div>
            <div className="sectors__card glass">
              <div className="ui ui--case" data-ui>
                <p className="ui__title">{frag.title}</p>
                <ul className="ui__list">
                  {frag.rows.map(([k, v], n) => (
                    <li key={k} className={`ui__row ui__row--2${n === frag.rows.length - 1 ? " is-on" : ""}`}>
                      <span className="ui__soft">{k}</span>
                      <span className={/needs|waiting|held/i.test(v) ? "status status--warn" : "status status--ok"}>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
