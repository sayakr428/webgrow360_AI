"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { TOC } from "@/lib/chapters";
import { onScroll, themeAt, toTop } from "@/lib/scroll";

// The fixed left rail: wordmark at the top, chapter index anchored to the bottom, legal links under it.
// Each part takes the colour of the section beneath it. On the home page the load intro builds it in (see Hero).
export function Rail() {
  const path = usePathname();
  const home = path === "/";
  const [active, setActive] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const mark = useRef<HTMLAnchorElement>(null);
  const toc = useRef<HTMLElement>(null);
  const legal = useRef<HTMLParagraphElement>(null);
  const rail = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = TOC.map((t) => document.getElementById(t.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [path]);

  useEffect(() => {
    const parts = [mark.current, toc.current, legal.current].filter(Boolean) as HTMLElement[];
    return onScroll(() => {
      for (const p of parts) {
        const r = p.getBoundingClientRect();
        if (!r.width) continue;
        p.dataset.on = themeAt(r.left + Math.min(40, r.width / 2), r.top + r.height / 2, rail.current);
      }
    });
  }, [home]);

  return (
    <>
      <aside className="rail" ref={rail} aria-label="Edition index">
        <Link href="/" className="rail__mark" ref={mark} aria-label="The Intelligence Edition, home" onClick={toTop}>
          The
          <br />
          Intell<span className="slash">//</span>gence
          <br />
          Edition
        </Link>
        <nav className="rail__toc" ref={toc} aria-label="Chapters">
          <ol>
            {TOC.map((t) => (
              <li key={t.id} className={active === t.id ? "is-on" : ""}>
                <a href={`/#${t.id}`} aria-current={active === t.id ? "true" : undefined}>
                  <span className="rail__label">{t.label}</span>
                  <span className="rail__line" aria-hidden="true" />
                  <span className="rail__num">{t.roman}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <p className="rail__legal" ref={legal}>
          © WebGrow360 Online · <Link href="/privacy">Privacy</Link> · <Link href="/about">About</Link>
        </p>
      </aside>

      {/* phones: the chapters sheet belongs to the home page; elsewhere the menu drawer covers navigation */}
      {path === "/" && (
        <button type="button" className="sheet-btn" aria-expanded={sheet} aria-controls="chapters-sheet" onClick={() => setSheet((s) => !s)}>
          Chapters
        </button>
      )}
      <div id="chapters-sheet" className={`sheet${sheet ? " is-open" : ""}`} hidden={!sheet}>
        <ol>
          {TOC.map((t) => (
            <li key={t.id}>
              <a href={`/#${t.id}`} onClick={() => setSheet(false)}>
                <span>{t.label}</span>
                <span className="rail__num">{t.roman}</span>
              </a>
            </li>
          ))}
        </ol>
        <p className="rail__legal">
          <Link href="/privacy" onClick={() => setSheet(false)}>
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/about" onClick={() => setSheet(false)}>
            About
          </Link>
        </p>
      </div>
    </>
  );
}
