import Link from "next/link";
import Image from "next/image";
import { SERVICES } from "@/lib/services";
import { ART } from "@/lib/chapters";
import { SITE } from "@/lib/site";
import { FooterOrbit } from "./FooterOrbit";
import { FooterWord } from "./FooterWord";
import { FooterFx, FooterForm } from "./FooterFx";

const VOICE = "That's all of me. Write to us. I read everything first.";

// Four corner registration marks, like a blueprint's, on the footer's main panels.
function Crops() {
  return (
    <>
      <i className="crop crop--tl" aria-hidden="true" />
      <i className="crop crop--tr" aria-hidden="true" />
      <i className="crop crop--bl" aria-hidden="true" />
      <i className="crop crop--br" aria-hidden="true" />
    </>
  );
}

// A link column. Its heading is a button so that, on phones, the column folds into an accordion; on wider screens
// FooterFx disables the button and the column is simply open.
function Col({ n, title, children, className = "" }: { n: string; title: string; children: React.ReactNode; className?: string }) {
  const id = `foot-col-${title.toLowerCase()}`;
  return (
    <div className={`foot__col is-open ${className}`}>
      <h2 className="foot__h">
        <button type="button" className="foot__toggle" aria-expanded="true" aria-controls={id}>
          <span>{n} / {title}</span>
          <span className="foot__plus" aria-hidden="true">+</span>
        </button>
      </h2>
      <div className="foot__list" id={id}>
        {children}
      </div>
    </div>
  );
}

// The footer: a dark orbit stage of turning type with a growing parchment disc and the call to action, a band where
// the dark stage dissolves into data, then the matte parchment body, the telemetry strip, the assembling wordmark
// and the bottom bar. The motion lives in the client parts (FooterOrbit, FooterWord, FooterFx); every link and line
// of copy is rendered here on the server.
export function Footer() {
  return (
    <footer className="footer" data-theme="dark" data-voice={VOICE}>
      <FooterOrbit voice="That's all of me. Write to us." email={SITE.email} />

      <div className="foot" data-theme="light">
        <div className="foot__grain" aria-hidden="true" />
        <div className="foot__grid">
          <div className="foot__brand">
            <Image src="/brand/logo.png" alt="WebGrow360 Online" width={84} height={84} />
            <p className="foot__line">
              The engineering arm of the WebGrow360 group. AI agents, automation and data systems, built in India for
              businesses everywhere.
            </p>
            <FooterForm email={SITE.email} />
          </div>

          <Col n="01" title="Services">
            <ul>
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="foot__a">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Col>

          <Col n="02" title="Company">
            <ul>
              <li>
                <Link href="/about" className="foot__a">About us</Link>
              </li>
              <li>
                <Link href="/#method" className="foot__a">How we work</Link>
              </li>
              <li>
                <Link href="/#faq" className="foot__a">Questions</Link>
              </li>
              <li>
                <Link href="/contact" className="foot__a">Contact</Link>
              </li>
              <li>
                <Link href="/privacy" className="foot__a">Privacy policy</Link>
              </li>
              <li>
                <Link href="/terms" className="foot__a">Terms of service</Link>
              </li>
            </ul>
          </Col>

          <Col n="03" title="Businesses">
            <ul>
              {SITE.network.map((b) => (
                <li key={b.label} className="foot__biz">
                  {b.href ? (
                    b.href.startsWith("http") ? (
                      <a href={b.href} target="_blank" rel="noopener noreferrer" className="foot__a">
                        {b.label}
                      </a>
                    ) : (
                      <Link href={b.href} className="foot__a">{b.label}</Link>
                    )
                  ) : (
                    <span>{b.label}</span>
                  )}
                  <small className={`chip chip--${b.state === "Soon" ? "soon" : b.state === "Visit" ? "visit" : "here"}`}>{b.state}</small>
                </li>
              ))}
            </ul>
          </Col>

          <Col n="04" title="Contact" className="foot__col--wide">
            <ul>
              <li>
                <a href={`mailto:${SITE.email}`} className="foot__a">{SITE.email}</a>
              </li>
              <li>
                <a href={SITE.phoneHref} className="foot__a">{SITE.phone}</a>
              </li>
              <li>
                <a href={SITE.mapHref} target="_blank" rel="noopener noreferrer" className="foot__a">
                  {SITE.address}
                </a>
              </li>
            </ul>
            <p className="foot__label foot__label--gap">Markets</p>
            <p className="foot__markets">{SITE.markets.join(" · ")}</p>
          </Col>
        </div>

        <div className="tele" aria-label="Studio telemetry">
          <div className="tele__track">
            {[0, 1].map((k) => (
              <p className="tele__row" key={k} aria-hidden={k === 1 ? "true" : undefined}>
                <span>LAT 22.5448° N · LON 88.3527° E</span>
                <span className="tele__dash">—</span>
                <span>
                  SYS ONLINE <b className="dot dot--live" aria-hidden="true" />
                </span>
                <span className="tele__dash">—</span>
                <span>BUILD 2026.11</span>
                <span className="tele__dash">—</span>
                <span>
                  LOCAL <time data-clock>--:--:--</time> IST
                </span>
                <span className="tele__dash">—</span>
                <span>
                  {SERVICES.length} SERVICES · {SITE.markets.length} MARKETS
                </span>
              </p>
            ))}
          </div>
        </div>

        <FooterWord />

        <div className="foot__bar">
          <p>© 2026 WebGrow360 Online. All rights reserved.</p>
          <p className="foot__bar-r">
            <Link href="/privacy" className="foot__a">Privacy policy</Link> · <Link href="/terms" className="foot__a">Terms</Link> · Interface previews show sample data.
            <button type="button" className="totop" data-totop aria-label="Back to top">
              <span aria-hidden="true">↑</span>
            </button>
          </p>
        </div>

        <details className="credits">
          <summary>
            Credits <span aria-hidden="true">+</span>
          </summary>
          <p className="credits__text" data-type>
            Paintings, all public domain via Wikimedia Commons:{" "}
            {Object.values(ART).map((a, i, all) => (
              <span key={a.src}>
                <a href={a.href} target="_blank" rel="noopener noreferrer">
                  {a.credit}
                </a>
                {i < all.length - 1 ? "; " : "."}
              </span>
            ))}{" "}
            Photographs, objects and the About painting are original images made for WebGrow360 .AI.
          </p>
        </details>
        <Crops />
      </div>
      <FooterFx />
    </footer>
  );
}
