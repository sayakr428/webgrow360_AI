"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";
import { SwashHeading } from "./Editorial";

// An accordion with hairline separators. One item open at a time; the height animates with grid rows 0fr → 1fr,
// and the + turns into ×.
export function Faq({ items, title = "Questions, answered", id = "faq" }: { items: { q: string; a: string }[]; title?: string; id?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section id={id} className="faq" data-theme="light" aria-labelledby={`${id}-h`}>
      <div className="faq__head" data-reveal>
        <SwashHeading text={title} id={`${id}-h`} className="sec-head" />
      </div>
      <div className="faq__list" data-reveal>
        {items.map((f, i) => {
          const on = open === i;
          return (
            <div key={f.q} className={`qa${on ? " is-open" : ""}`}>
              <h3 className="qa__h">
                <button
                  type="button"
                  aria-expanded={on}
                  aria-controls={`${id}-a${i}`}
                  id={`${id}-q${i}`}
                  onClick={() => {
                    on ? sound.close() : sound.open();
                    setOpen(on ? null : i);
                  }}
                  data-sfx="none"
                >
                  <span>{f.q}</span>
                  <span className="qa__icon" aria-hidden="true" />
                </button>
              </h3>
              <div className="qa__a" id={`${id}-a${i}`} role="region" aria-labelledby={`${id}-q${i}`}>
                <div>
                  <p>{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
