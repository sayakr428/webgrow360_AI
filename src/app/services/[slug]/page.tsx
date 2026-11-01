import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChapterStage } from "@/components/Stage";
import { Study } from "@/components/Study";
import { StageObject } from "@/components/Art";
import { SERVICE_FRAGMENTS } from "@/components/Fragments";
import { Process } from "@/components/Process";
import { Faq } from "@/components/Faq";
import { Cta } from "@/components/Cta";
import { SwashHeading } from "@/components/Editorial";
import { SERVICES, FAQS, getService } from "@/lib/services";
import { CHAPTERS } from "@/lib/chapters";
import { SITE, VIDEOS } from "@/lib/site";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) return {};
  return {
    title: s.seoTitle,
    description: s.seoDescription,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { title: `${s.name} | ${SITE.product}`, description: s.seoDescription, url: `/services/${s.slug}` },
  };
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = getService(slug);
  const chapter = CHAPTERS.find((c) => c.slug === slug);
  if (!s || !chapter) notFound();
  const Frag = SERVICE_FRAGMENTS[s.slug];
  const faqs = [...s.faqs, FAQS[2], FAQS[4]];
  const video = chapter.prop === "laptop" ? { src: VIDEOS.showcase[2].src, poster: VIDEOS.showcase[2].poster } : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: s.name,
        serviceType: s.name,
        description: s.summary,
        url: `${SITE.url}/services/${s.slug}`,
        provider: { "@type": "Organization", name: SITE.product, url: SITE.url },
        areaServed: "IN",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Services", item: `${SITE.url}/#agents` },
          { "@type": "ListItem", position: 3, name: s.name, item: `${SITE.url}/services/${s.slug}` },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChapterStage
        id="top"
        art={chapter.art}
        sequence={chapter.sequence}
        word={s.name}
        subtitle={chapter.subtitle}
        mood={chapter.mood}
        priority
        as="h1"
        tear={1}
        object={<StageObject kind={chapter.prop} video={video} />}
        card={<Frag />}
      />

      <section className="overview" data-theme="light" aria-label="Overview">
        <p className="crumbs">
          <Link href="/">Edition</Link> / Chapter {chapter.roman} / {chapter.label}
        </p>
        <p className="overview__text" data-reveal>
          {s.intro}
        </p>
      </section>

      <Study chapter={chapter} service={s} />
      <Process id="service-method" />
      <Faq items={faqs} title="Your questions" id="service-faq" />

      <section className="related" data-theme="light" aria-labelledby="related-h">
        <SwashHeading text="Read on" id="related-h" className="sec-head" />
        <ul className="related__list">
          {s.related.map((r) => {
            const rs = getService(r)!;
            const rc = CHAPTERS.find((c) => c.slug === r)!;
            return (
              <li key={r} data-reveal>
                <Link href={`/services/${r}`}>
                  <span className="related__num">{rc.roman}</span>
                  <span className="related__name">{rs.name}</span>
                  <span className="related__fact">{rs.fact}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Cta service={s.name} id="service-contact" />
    </main>
  );
}
