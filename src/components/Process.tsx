"use client";

import { useEffect, useRef } from "react";
import { STEPS, INCLUDED } from "@/lib/services";
import { onScroll, progress } from "@/lib/scroll";
import { SwashHeading } from "./Editorial";
import { SkillCloud } from "./SkillCloud";

const ROMAN = ["I", "II", "III", "IV"];

// Four steps as cards that pin and stack as you scroll, joined by a gilt line that draws itself;
// then the cloud of automations and the four guarantees.
export function Process({ id = "method" }: { id?: string }) {
  const steps = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = steps.current;
    if (!el) return;
    return onScroll(() => el.style.setProperty("--draw", Math.min(1, progress(el) * 1.6).toFixed(3)));
  }, []);

  return (
    <section id={id} className="method" data-theme="light" aria-labelledby={`${id}-h`}>
      <div className="method__head" data-reveal>
        <SwashHeading text="Method, not magic" id={`${id}-h`} className="sec-head" />
        <p className="lede">
          Four steps, the same every time. You see working software on your own data within a month, and you own every line
          of it at the end.
        </p>
      </div>
      <ol className="steps" ref={steps}>
        <span className="steps__line" aria-hidden="true" />
        {STEPS.map((s, i) => (
          <li key={s.name} className="step" style={{ "--i": i } as React.CSSProperties}>
            <span className="step__num" aria-hidden="true">
              {ROMAN[i]}
            </span>
            <div>
              <h3 className="step__name">{s.name}</h3>
              <p className="step__body">{s.body}</p>
              <span className="step__chip">{s.out}</span>
            </div>
          </li>
        ))}
      </ol>

      <div className="skills-wrap" data-reveal>
        <div className="skills-wrap__intro">
          <h3 className="feature__label">Automations, on request</h3>
          <p className="feature__text">A few of the jobs businesses hand to us first. Each becomes a reusable skill your team can call.</p>
        </div>
        <SkillCloud />
      </div>

      <dl className="guarantees" data-reveal>
        {INCLUDED.map((x) => (
          <div key={x.name}>
            <dt>{x.name}</dt>
            <dd>{x.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
