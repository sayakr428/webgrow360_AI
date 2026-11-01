import { Hero } from "@/components/Hero";
import { ChapterStage } from "@/components/Stage";
import { Study } from "@/components/Study";
import { ShatterTransition } from "@/components/Shatter";
import { StageObject } from "@/components/Art";
import { SERVICE_FRAGMENTS } from "@/components/Fragments";
import { Industries } from "@/components/Industries";
import { Process } from "@/components/Process";
import { Calculator } from "@/components/Calculator";
import { Founders } from "@/components/Founders";
import { StatCounter } from "@/components/Counter";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";
import { SwashHeading, Pill } from "@/components/Editorial";
import { SERVICES, FAQS, getService } from "@/lib/services";
import { CHAPTERS, ART, SHATTER_AFTER, SHATTER_ART } from "@/lib/chapters";
import { STORY } from "@/lib/team";
import { SITE, VIDEOS } from "@/lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#org`,
        name: SITE.product,
        url: SITE.url,
        logo: `${SITE.url}/brand/logo.png`,
        email: SITE.email,
        telephone: SITE.phone,
        foundingDate: "2019",
        address: { "@type": "PostalAddress", streetAddress: "25B Camac Street", addressLocality: "Kolkata", postalCode: "700016", addressCountry: "IN" },
        parentOrganization: { "@type": "Organization", name: "WebGrow360 Online", url: "https://webgrow360.online/" },
        description: SITE.description,
      },
      {
        "@type": "ItemList",
        name: "AI engineering services",
        itemListElement: SERVICES.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE.url}/services/${s.slug}`, name: s.name })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />

      {/* ── Chapters I–VI ── */}
      {CHAPTERS.map((c, i) => {
        const service = getService(c.slug)!;
        const Frag = SERVICE_FRAGMENTS[service.slug];
        const prev = CHAPTERS[i - 1];
        const afterShatter = prev && SHATTER_AFTER.has(prev.id);
        const video = c.prop === "laptop" ? { src: VIDEOS.showcase[2].src, poster: VIDEOS.showcase[2].poster } : undefined;
        return (
          <div key={c.id} className="chapter">
            <ChapterStage
              id={c.id}
              art={c.art}
              sequence={c.sequence}
              word={c.word}
              subtitle={c.subtitle}
              mood={c.mood}
              tear={i}
              tearTop={!afterShatter && i % 2 === 1}
              enterFromLines={i === 0}
              object={<StageObject kind={c.prop} video={video} />}
              card={<Frag />}
            />
            <Study chapter={c} service={service} />
            {SHATTER_AFTER.has(c.id) && CHAPTERS[i + 1] && <ShatterTransition from={SHATTER_ART[c.id]?.from ?? c.art} to={SHATTER_ART[c.id]?.to ?? CHAPTERS[i + 1].art} />}
          </div>
        );
      })}

      {/* ── Interlude on parchment: the edition in numbers (moved here so the hero dissolves straight into Chapter I) ── */}
      <section className="intro" data-theme="light" aria-labelledby="intro-h">
        <div className="intro__text" data-reveal>
          <SwashHeading text="A new way to run a business" id="intro-h" className="sec-head" />
          <p className="lede">
            WebGrow360 .AI maps your workflows, builds the agents and automations that take them over, and hands you every
            line of code. This edition covers the six things we build, the sectors we build them for, and the people behind
            them.
          </p>
          <div className="intro__ctas">
            <Pill href={SITE.booking} variant="solid">
              Book a free discovery call
            </Pill>
            <Pill href={SITE.whatsapp} external variant="outline">
              Chat on WhatsApp
            </Pill>
          </div>
        </div>
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
        <div className="intro__float art-float" aria-hidden="true">
          <div className="note">
            <p className="note__ask">Find why Halden&apos;s invoice failed and draft a reply</p>
            <p className="note__answer">Card expired on INV-8812. Update link drafted for your approval.</p>
            <span className="prompt__bar">
              <img src="/brand/mark.png" alt="" width={16} height={16} />
              <span className="prompt__send">↑</span>
            </span>
          </div>
        </div>
      </section>

      <Industries />
      <Process />
      <Calculator />

      {/* ── Chapter IX: the people ── */}
      <ChapterStage
        id="about"
        art={ART.geographer}
        word="Minds"
        subtitle="Twenty-five years of sales, meeting global-scale AI engineering."
        mood="candle"
        tear={2}
        short
      />
      <section className="leaders" data-theme="light" aria-labelledby="leaders-h">
        <div className="leaders__copy" data-reveal>
          <SwashHeading text="Led from Kolkata, rooted in Agartala" id="leaders-h" className="sec-head" />
          <p className="lede">{STORY.intro}</p>
          <p className="feature__small">
            Our CTO&apos;s work includes machine learning on the FIFA World Cup 2026 road safety network and network
            automation for the 2024 Asian Games. Our CEO has led customer-first sales for a quarter of a century.
          </p>
          <Pill href="/about">Read our story</Pill>
        </div>
        <div data-reveal>
          <Founders compact />
        </div>
      </section>

      <Faq items={FAQS} />
      <Cta />
    </main>
  );
}
