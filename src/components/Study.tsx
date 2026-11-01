"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CHAPTER_PROPS, WELL_PHOTOS, wellSrc, type Chapter } from "@/lib/chapters";
import type { Service } from "@/lib/services";
import { onScroll, reducedMotion } from "@/lib/scroll";
import { SwashHeading, Pill } from "./Editorial";
import { PromptCard } from "./PromptCard";
import { FloatingProp } from "./Art";

const PROMPTS: Record<string, string[]> = {
  "custom-ai-agents": ["Find why Halden's last invoice failed and draft a reply", "Pull every open ticket from enterprise accounts and summarise the risk", "Remember that Ardent prefers WhatsApp over email"],
  "ai-workflow-automation": ["Route any expense over ₹1,00,000 to the finance head", "Read today's supplier invoices and match them to POs", "Send me only the approvals that need a human"],
  "data-pipeline-automation": ["Sync new HubSpot deals to the warehouse every 5 minutes", "Alert me when billing events stop arriving", "Show which dashboards use the orders table"],
  "llm-integration": ["Can contractors expense travel? Cite the policy", "Find every contract with an auto-renewal clause", "Extract name, amount and due date from this PDF"],
  "ai-app-development": ["Summarise the Northwind renewal risk for the deal desk", "Stream the answer while the agent checks the CRM", "Ship the assistant to 40 sales reps on Monday"],
  "process-intelligence": ["Rank our 23 processes by automation potential", "How many hours a month does invoice intake take?", "Build the roadmap for the first three automations"],
};

const ANSWERS: Record<string, string> = {
  "custom-ai-agents": "Card expired on INV-8812. I drafted an update-link email to Halden Ltd and logged it on ticket 5520. Approve to send.",
  "ai-workflow-automation": "3 expenses routed to the finance head. 38 approved automatically against policy. Audit log updated.",
  "data-pipeline-automation": "HubSpot deals now land in the warehouse every 5 minutes. Freshness check and alert are live.",
  "llm-integration": "Yes, if travel is in the signed statement of work and booked through the portal. Contractor policy §4.2, Expenses §1.7.",
  "ai-app-development": "Usage is down 18% since March and two champions have left. Renewal is in 41 days; I suggest a call this week.",
  "process-intelligence": "Invoice intake scores 92: 310 hours a month, 4% error rate, clear rules. Start there.",
};

function Answer({ ask, answer }: { ask: string; answer: string }) {
  return (
    <div className="answer" data-ui>
      <p className="answer__ask">{ask}</p>
      <p className="answer__text">{answer}</p>
      <span className="prompt__bar">
        <img src="/brand/mark.png" alt="" width={16} height={16} />
        <span className="answer__done">Done · 2.4 s</span>
      </span>
    </div>
  );
}

// A cloud of prompts drifting in space: one sharp glass card, ghost cards behind it at different depths.
function UiCloud({ chapter, children }: { chapter: Chapter; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    return onScroll(() => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      for (const l of layers) l.style.translate = `0 ${(c * Number(l.dataset.depth) * 120).toFixed(1)}px`;
    });
  }, []);
  const props = CHAPTER_PROPS[chapter.id];
  return (
    <div className="cloud" ref={ref}>
      {chapter.ghosts.map((g, i) => (
        <div key={g} className={`cloud__ghost cloud__ghost--${i}`} data-depth={[0.5, 0.8, 0.35, 0.65][i]}>
          <PromptCard text={g} ghost />
        </div>
      ))}
      <div className="cloud__main glass" data-depth="0.15">
        {children}
      </div>
      {chapter.chips.map((c, i) => (
        <span key={c} className={`chip-pop chip-pop--${i}`} data-depth={[0.25, 0.45, 0.3][i]} style={{ "--i": i } as React.CSSProperties}>
          <i aria-hidden="true" />
          {c}
        </span>
      ))}
      <FloatingProp kind={props[0]} className="cloud__prop cloud__prop--a" delay={1.3} />
      <FloatingProp kind={props[1]} className="cloud__prop cloud__prop--b" delay={3.1} />
    </div>
  );
}

export function Study({ chapter, service, headingAs = "h2" }: { chapter: Chapter; service: Service; headingAs?: "h2" | "h3" }) {
  const prompts = PROMPTS[service.slug];
  const [lead, ...rest] = service.features;
  return (
    <>
      <section className="study" data-theme="light" aria-labelledby={`${chapter.id}-study`}>
        <div className="study__intro" data-reveal>
          <SwashHeading text={chapter.headline} id={`${chapter.id}-study`} as={headingAs} className="study__head" />
          <div className="feature">
            <h3 className="feature__label">{lead.name}</h3>
            <p className="feature__text">{lead.body}</p>
            <Pill href={`/services/${service.slug}`}>Explore {service.name}</Pill>
          </div>
        </div>
        <div className="study__scene" data-reveal>
          <UiCloud chapter={chapter}>
            <Answer ask={prompts[0]} answer={ANSWERS[service.slug]} />
          </UiCloud>
        </div>

        <div className="wells">
          {rest.map((f, i) => (
            <figure key={f.name} className="well-fig" data-reveal>
              <div className="well">
                <Image src={wellSrc(chapter.id, i)} alt={WELL_PHOTOS[chapter.id][i]} fill sizes="(max-width: 900px) 100vw, 40vw" className="well__img" />
                <PromptCard text={prompts[i + 1]} className="well__prompt" />
              </div>
              <figcaption>
                <h3 className="feature__label">{f.name}</h3>
                <p className="feature__small">{f.body}</p>
                <Pill href={`/services/${service.slug}`}>Read more</Pill>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="ledger-wrap" data-theme="light" aria-label={`${service.name}: what you get`}>
        <div className="ledger" data-reveal>
          <div className="ledger__heads">
            <p className="feature__label">What you get</p>
            <p className="feature__label">Where it pays off</p>
          </div>
          <dl className="ledger__grid">
            {service.deliverables.map((d, i) => (
              <div key={d} className="ledger__row">
                <dt>{d}</dt>
                <dd>{service.useCases[i]}</dd>
              </div>
            ))}
          </dl>
          <div className="ledger__ask">
            <p className="feature__label">Try asking</p>
            <PromptCard text={prompts[0]} />
          </div>
        </div>
      </section>
    </>
  );
}
