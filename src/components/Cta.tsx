"use client";

import Image from "next/image";
import { useState } from "react";
import { SITE } from "@/lib/site";
import { SwashHeading, TornEdge } from "./Editorial";
import { GlowBurst } from "./Art";

// The closing stage bookends the cover: the two hands again, close up, the glow returning, and the form inside the
// same hairline frame. Every other way to reach a person sits beneath it as a ledger.
export function Cta({ service, id = "contact" }: { service?: string; id?: string }) {
  const [sent, setSent] = useState(false);
  return (
    <>
      <section id={id} className="finale" data-theme="dark" aria-labelledby={`${id}-h`}>
        <div className="finale__art" aria-hidden="true">
          <Image src="/art/creation-2020s.webp" alt="" fill sizes="100vw" style={{ objectPosition: "37% 46%" }} />
        </div>
        <div className="stage__vignette" aria-hidden="true" />
        <GlowBurst className="finale__glow" />
        <div className="frame frame--finale" data-reveal>
          <svg className="frame__line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect x="0.5" y="0.5" width="99" height="99" pathLength={100} vectorEffect="non-scaling-stroke" />
          </svg>
          <SwashHeading text="Let's begin" id={`${id}-h`} className="finale__head" />
          <p className="frame__lede">Tell us what eats your team&apos;s week. The first call includes a free architecture review, with no commitment.</p>
          <form
            className="finale__form"
            onSubmit={(e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email");
              const subject = encodeURIComponent(service ? `AI discovery call: ${service}` : "AI discovery call");
              const body = encodeURIComponent(
                `Hi WebGrow360,\n\nI'd like to book an AI discovery call${service ? ` about ${service}` : ""}.\nReply to: ${email}\n\nWhat we want to automate or build:\n`
              );
              window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
              setSent(true);
            }}
          >
            <label htmlFor={`${id}-email`}>Your work email</label>
            <input id={`${id}-email`} name="email" type="email" required placeholder="you@company.com" autoComplete="email" spellCheck={false} />
            <button type="submit" className="button button--light">
              Book my call
            </button>
            <p className="finale__note" aria-live="polite">
              {sent ? "Your email app should be open with the message written. Send it and we'll reply within one working day." : "We reply within one working day."}
            </p>
          </form>
        </div>
        <TornEdge variant={3} />
      </section>
      <section className="routes" data-theme="light" aria-label="Other ways to reach us">
        <dl className="routes__grid">
          <div>
            <dt>WhatsApp</dt>
            <dd>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                Chat with us now
              </a>
            </dd>
          </div>
          <div>
            <dt>Call</dt>
            <dd>
              <a href={SITE.phoneHref}>{SITE.phone}</a>
            </dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </div>
          <div>
            <dt>Office</dt>
            <dd>
              <a href={SITE.mapHref} target="_blank" rel="noopener noreferrer">
                {SITE.address}
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </>
  );
}
