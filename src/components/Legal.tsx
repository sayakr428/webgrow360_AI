import Link from "next/link";
import { SwashHeading } from "./Editorial";

export type LegalSection = { id: string; title: string; body?: string[]; list?: string[]; after?: string };

const DOCS = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
];

// The shared layout of the legal pages: a switcher between the documents, the title and plain-language summary,
// a sticky table of contents and numbered sections.
export function LegalPage({
  current,
  title,
  lede,
  updated,
  sections,
}: {
  current: "/privacy" | "/terms";
  title: string;
  lede: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main id="main" className="legal" data-theme="light">
      <header className="legal__head">
        <nav className="legal__docs" aria-label="Legal documents">
          {DOCS.map((d) => (
            <Link key={d.href} href={d.href} aria-current={d.href === current ? "page" : undefined}>
              {d.label}
            </Link>
          ))}
        </nav>
        <SwashHeading as="h1" text={title} className="legal__title" />
        <p className="lede">{lede}</p>
        <p className="legal__meta">
          Last updated <time>{updated}</time> · Applies to ai.webgrow360.online and our AI services
        </p>
      </header>
      <div className="legal__body">
        <nav className="legal__toc" aria-label="On this page">
          <p className="label">On this page</p>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="legal__article">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
              <h2 id={`${s.id}-h`}>
                <span className="legal__n" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </h2>
              {s.body?.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
              {s.list && (
                <ul>
                  {s.list.map((l) => (
                    <li key={l.slice(0, 32)}>{l}</li>
                  ))}
                </ul>
              )}
              {s.after && <p>{s.after}</p>}
            </section>
          ))}
          <p className="legal__back">
            Questions about this document? <Link href="/contact">Contact us</Link> or read the{" "}
            {current === "/privacy" ? <Link href="/terms">terms of service</Link> : <Link href="/privacy">privacy policy</Link>}.
          </p>
        </article>
      </div>
    </main>
  );
}
