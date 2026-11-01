import type { Metadata } from "next";
import { ChapterStage } from "@/components/Stage";
import { LeaderCards } from "@/components/LeaderCards";
import { StatCounter } from "@/components/Counter";
import { Cta } from "@/components/Cta";
import { SwashHeading } from "@/components/Editorial";
import { STORY, TEAM } from "@/lib/team";
import { COUNCIL } from "@/lib/chapters";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us: Our Story & Leadership",
  description:
    "WebGrow360 was founded in 2019 in Agartala, Tripura, and now serves 100+ businesses across India from Kolkata. Meet our leadership: CEO Sushanta Bhattacharya and CTO Sayak Roy.",
  alternates: { canonical: "/about" },
};

const ROMAN = ["I", "II", "III", "IV"];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About WebGrow360 AI",
    url: `${SITE.url}/about`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.product,
      foundingDate: "2019",
      foundingLocation: "Agartala, Tripura, India",
      employee: TEAM.map((m) => ({ "@type": "Person", name: m.name.replace(/^(Mr\.|Er\.) /, ""), jobTitle: m.title, ...(m.linkedin ? { sameAs: m.linkedin } : {}) })),
    },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChapterStage id="story" art={{ ...COUNCIL, credit: "", href: "" }} word="Our story" subtitle="Bridging the digital divide, from Agartala to all of India." priority as="h1" tear={2} short />

      <section className="story" data-theme="light" aria-labelledby="story-h">
        <div className="story__copy" data-reveal>
          <SwashHeading text={`Established ${STORY.founded}`} id="story-h" className="sec-head" />
          <p className="lede">{STORY.intro}</p>
          {STORY.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="feature__small">
              {p}
            </p>
          ))}
          <p className="feature__small muted">Agartala, Tripura · 23.83° N, 91.28° E. Now headquartered in Kolkata, serving 15+ states.</p>
        </div>
        <ol className="timeline" data-reveal>
          {STORY.timeline.map((t, i) => (
            <li key={t.when}>
              <span className="timeline__num">{ROMAN[i]}</span>
              <span className="feature__label">{t.when}</span>
              <span className="timeline__what">{t.what}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="intro intro--about" data-theme="light" aria-label="WebGrow360 in numbers">
        <dl className="stats" data-reveal>
          {STORY.numbers.map((n) => (
            <div key={n.label}>
              <dt>
                <StatCounter value={n.value} suffix={n.suffix} kind={n.value === 2019 ? "year" : "count"} />
              </dt>
              <dd>{n.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mission" data-theme="light" aria-labelledby="mission-h">
        <h2 className="feature__label" id="mission-h">
          Our mission
        </h2>
        <p className="mission__text" data-reveal>
          {STORY.mission}
        </p>
      </section>

      <section className="method method--plain" data-theme="light" aria-labelledby="values-h">
        <SwashHeading text="Principles we keep" id="values-h" className="sec-head" />
        <dl className="guarantees" data-reveal>
          {STORY.values.map((v) => (
            <div key={v.name}>
              <dt>{v.name}</dt>
              <dd>{v.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="leaders leaders--cards" data-theme="light" aria-labelledby="team-h">
        <LeaderCards
          intro={
            <>
              <SwashHeading text="Our leadership" id="team-h" className="sec-head" />
              <p className="lede">
                WebGrow360 is led by executives who combine a quarter-century of sales and customer-focused leadership with
                global-scale AI engineering.
              </p>
              <p className="feature__small">
                That engineering now powers our growth stack: marketing automation that captures, scores and nurtures every lead
                over WhatsApp and email, CRM pipelines on HubSpot, Zoho and custom builds, and MCP-connected AI agents that read
                and act on live Meta Ads and CRM data.
              </p>
              <p className="feature__small">
                Together with our specialised creative and domain leads, we make sure no strategy gets lost in handover, from the
                first idea to the last conversion.
              </p>
            </>
          }
        />
      </section>

      <section className="related" data-theme="light" aria-labelledby="group-h">
        <SwashHeading text="One group, many ways to grow" id="group-h" className="sec-head" />
        <ul className="related__list">
          {SITE.network.map((b, i) => (
            <li key={b.label} data-reveal>
              <a href={b.href ?? undefined} aria-disabled={!b.href} {...(b.href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                <span className="related__num">{ROMAN[i]}</span>
                <span className="related__name">{b.label}</span>
                <span className="related__fact">{b.state}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <Cta />
    </main>
  );
}
