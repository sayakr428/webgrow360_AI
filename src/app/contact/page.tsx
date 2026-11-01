import type { Metadata } from "next";
import Link from "next/link";
import { ChapterStage } from "@/components/Stage";
import { SwashHeading } from "@/components/Editorial";
import { ContactForm } from "@/components/ContactForm";
import { ART } from "@/lib/chapters";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Talk to WebGrow360 AI about agents, workflow automation, data pipelines, LLM integration or an AI app. A person replies within one working day. Kolkata, India.",
  alternates: { canonical: "/contact" },
};

const STEPS = [
  { t: "We read it", d: "A person, not a bot, reads your note and replies within one working day, with questions or a time to talk." },
  { t: "A 30-minute call", d: "We walk through the process with whoever runs it today, and say plainly where AI helps and where it doesn’t." },
  { t: "A written proposal", d: "Scope, deliverables, acceptance criteria, timeline and cost, in writing, before any work starts." },
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact WebGrow360 AI",
    url: `${SITE.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE.product,
      email: SITE.email,
      telephone: SITE.phone.replace(/\s/g, ""),
      address: { "@type": "PostalAddress", streetAddress: "25B Camac Street", addressLocality: "Kolkata", postalCode: "700016", addressCountry: "IN" },
      contactPoint: { "@type": "ContactPoint", contactType: "sales", email: SITE.email, telephone: SITE.phone.replace(/\s/g, ""), areaServed: "IN", availableLanguage: "en" },
    },
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChapterStage
        id="contact-stage"
        art={ART.lady}
        word="Contact"
        subtitle="Tell us about the work. A person replies within a working day."
        mood="candle"
        priority
        as="h1"
        tear={1}
        short
        card={
          <div className="ui" data-ui>
            <p className="ui__title">Reaching us</p>
            <ul className="ui__list">
              <li className="ui__row ui__row--2 is-on">
                <span>Email</span>
                <span className="ui__flag">Reply within a working day</span>
              </li>
              <li className="ui__row ui__row--2">
                <span>Phone</span>
                <span className="ui__soft">{SITE.phone}</span>
              </li>
              <li className="ui__row ui__row--2">
                <span>Studio</span>
                <span className="ui__soft">Camac Street, Kolkata</span>
              </li>
            </ul>
          </div>
        }
      />

      <section className="contact" data-theme="light" aria-labelledby="contact-h">
        <div className="contact__side">
          <SwashHeading text="Write to us" id="contact-h" className="sec-head" />
          <p className="contact__lede">
            One process that eats your team’s week is enough to start. Tell us what it is and the systems it touches; we’ll tell you honestly whether AI is
            the right fix.
          </p>

          <dl className="channels">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={SITE.phoneHref}>{SITE.phone}</a>
              </dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
                  Message us on WhatsApp
                </a>
              </dd>
            </div>
            <div>
              <dt>Studio</dt>
              <dd>
                <a href={SITE.mapHref} target="_blank" rel="noopener noreferrer">
                  {SITE.address}
                </a>
              </dd>
            </div>
            <div>
              <dt>Prefer a call?</dt>
              <dd>
                <a href={SITE.booking}>Book a 30-minute discovery call</a>
              </dd>
            </div>
          </dl>

          <div className="next">
            <p className="label">What happens next</p>
            <ol>
              {STEPS.map((s, i) => (
                <li key={s.t}>
                  <span className="next__n" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="next__t">{s.t}</p>
                    <p className="next__d">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="contact__fine">
              We’re happy to sign an NDA before the call. How we handle what you send is set out in our <Link href="/privacy">privacy policy</Link> and{" "}
              <Link href="/terms">terms of service</Link>.
            </p>
          </div>
        </div>

        <div className="contact__form">
          <ContactForm email={SITE.email} whatsapp={SITE.whatsapp} services={[...SERVICES.map((s) => s.name), "Not sure yet"]} />
        </div>
      </section>
    </main>
  );
}
