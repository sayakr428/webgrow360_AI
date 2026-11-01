"use client";

import { useRef, useState } from "react";
import { sound } from "@/lib/sound";
import { SwashHeading } from "./Editorial";
import { Starfield } from "./Art";

const SHARE = 0.6; // planning assumption: the share of repetitive work automation removes
const WEEKS = 46; // working weeks in a year

// An odometer: each digit is a column of 0-9 that rolls to its value.
function Odometer({ value }: { value: number }) {
  const text = value.toLocaleString("en-US");
  return (
    <span className="odo" aria-hidden="true">
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <span key={`${text.length - i}`} className="odo__digit">
            <span className="odo__reel" style={{ transform: `translateY(${-Number(ch) * 10}%)` }}>
              {"0123456789".split("").map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span key={`s${text.length - i}`} className="odo__sep">
            {ch}
          </span>
        )
      )}
    </span>
  );
}

// The instrument: set your team's manual hours and read what automation could hand back in a year.
export function Calculator() {
  const [hours, setHours] = useState(120);
  const lastStep = useRef(120);
  const result = Math.round(hours * SHARE * WEEKS);

  return (
    <section id="hours" className="hours" data-theme="dark" aria-labelledby="calc-h">
      <Starfield />
      <div className="hours__inner">
        <div className="hours__top" data-reveal>
          <SwashHeading text="Hours, returned" id="calc-h" className="sec-head" />
          <p className="lede">How many hours a week does your team spend on repetitive work?</p>
          <div className="hours__control" data-ui>
            <label htmlFor="hours-range">
              Team hours on repetitive work <output htmlFor="hours-range">{hours} h</output>
            </label>
            <input
              id="hours-range"
              type="range"
              min={10}
              max={1000}
              step={10}
              value={hours}
              style={{ "--p": (hours - 10) / 990 } as React.CSSProperties}
              onChange={(e) => {
                const v = Number(e.target.value);
                setHours(v);
                if (Math.abs(v - lastStep.current) >= 30) {
                  lastStep.current = v;
                  sound.step((v - 10) / 990);
                }
              }}
            />
          </div>
        </div>
        <div className="hours__result" data-reveal>
          <p className="calc__figure">
            <span className="sr-only" aria-live="polite">
              {result.toLocaleString("en-US")} hours back a year
            </span>
            <Odometer value={result} />
            <span className="calc__unit" aria-hidden="true">
              hours back a year
            </span>
          </p>
          <p className="calc__how">
            Your weekly hours × 60% of repetitive work automated × {WEEKS} working weeks. A planning figure: discovery
            measures your real one.
          </p>
        </div>
      </div>
    </section>
  );
}
