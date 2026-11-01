"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { name: "Read the accounts-payable inbox", out: "14 PDFs", t: 0.8 },
  { name: "Extract vendor, amount and PO", out: "14 of 14", t: 3.1 },
  { name: "Match to purchase orders", out: "13 matched · 1 mismatch", t: 1.2 },
  { name: "Route the mismatch for approval", out: "Sent to J. Rivera", t: 0.2 },
  { name: "Post bills to the ERP", out: "13 posted · $48,210.40", t: 0.9 },
];
const TOTAL = STEPS.reduce((s, x) => s + x.t, 0).toFixed(1);

// The hero's live fragment: an automation run that plays through its steps, then starts again.
export function HeroRun() {
  const [done, setDone] = useState(STEPS.length);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    setDone(0);
    let timer = 0;
    const tick = () => {
      n = n >= STEPS.length ? 0 : n + 1;
      setDone(n);
      timer = window.setTimeout(tick, n >= STEPS.length ? 4200 : n === 0 ? 700 : 950);
    };
    timer = window.setTimeout(tick, 1900);
    return () => window.clearTimeout(timer);
  }, []);

  const running = done < STEPS.length;
  return (
    <div className="ui ui--hero" data-ui>
      <div className="ui__head">
        <p className="ui__title">Invoice intake · run 2,481</p>
        <p className={`ui__status${running ? " is-running" : ""}`}>{running ? "Running" : "Complete"}</p>
      </div>
      <ol className="ui__steps">
        {STEPS.map((s, i) => {
          const state = i < done ? "done" : i === done ? "active" : "wait";
          return (
            <li key={s.name} className={`is-${state}`}>
              <span className="ui__dot" aria-hidden="true" />
              <span>{s.name}</span>
              <span className="ui__soft">{state === "wait" ? "Queued" : state === "active" ? "Working" : s.out}</span>
              <span className="ui__soft ui__num">{state === "done" ? `${s.t.toFixed(1)} s` : ""}</span>
            </li>
          );
        })}
      </ol>
      <p className="ui__foot">
        <span>Total {TOTAL} s</span>
        <span>1 waiting on a person</span>
      </p>
    </div>
  );
}
