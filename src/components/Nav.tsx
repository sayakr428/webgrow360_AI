"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useExperience } from "./Experience";
import { SERVICES } from "@/lib/services";
import { SITE } from "@/lib/site";
import { onScroll, themeAt, toTop } from "@/lib/scroll";

const LINKS = [
  { href: "/#industries", label: "Industries" },
  { href: "/#method", label: "Method" },
  { href: "/#faq", label: "Questions" },
  { href: "/about", label: "About" },
];

// The label slides up and an identical copy slides in from below on hover (transform only).
function Swap({ children }: { children: string }) {
  return (
    <span className="swap">
      <span className="swap__a">{children}</span>
      <span className="swap__b" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

const lenis = () => (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;

// A floating glass pill: mark and edition, a Services mega menu, the page links, the two ambient toggles and
// Contact. Over paintings it is smoked glass with white type; over parchment, frosted paper with ink. Under 980px
// the links fold into a full-screen drawer that traps focus and closes on Escape.
export function Nav() {
  const { soundOn, soul, toggleSound, toggleSoul } = useExperience();
  const path = usePathname();
  const [mega, setMega] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [lifted, setLifted] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const megaBtn = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const hoverT = useRef(0);

  useEffect(
    () =>
      onScroll(() => {
        setTheme(themeAt(innerWidth / 2, 34, bar.current));
        setLifted(scrollY > 24);
      }),
    []
  );

  // close everything on navigation (state adjusted during render when the route changes)
  const [shownPath, setShownPath] = useState(path);
  if (shownPath !== path) {
    setShownPath(path);
    setMega(false);
    setDrawer(false);
  }

  // mega menu: Escape returns focus to its button; a click outside closes it
  useEffect(() => {
    if (!mega) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMega(false);
      megaBtn.current?.focus();
    };
    const down = (e: PointerEvent) => {
      if (!bar.current?.contains(e.target as Node)) setMega(false);
    };
    addEventListener("keydown", key);
    addEventListener("pointerdown", down);
    return () => {
      removeEventListener("keydown", key);
      removeEventListener("pointerdown", down);
    };
  }, [mega]);

  // drawer: lock scroll, trap focus, Escape closes and returns focus to the menu button
  useEffect(() => {
    if (!drawer) return;
    const root = document.documentElement;
    root.classList.add("nav-locked");
    lenis()?.stop();
    const panel = drawerRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []).filter((el) => el.offsetParent !== null);
    const raf = requestAnimationFrame(() => focusables()[0]?.focus());
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDrawer(false);
        burger.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const f = [burger.current, ...focusables()].filter((el): el is HTMLElement => !!el);
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("keydown", key);
      root.classList.remove("nav-locked");
      lenis()?.start();
    };
  }, [drawer]);

  // hover intent on fine pointers: open after a beat, close a little later so the pointer can travel to the panel
  const enter = useCallback(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    window.clearTimeout(hoverT.current);
    hoverT.current = window.setTimeout(() => setMega(true), 90);
  }, []);
  const leave = useCallback(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    window.clearTimeout(hoverT.current);
    hoverT.current = window.setTimeout(() => setMega(false), 220);
  }, []);

  const current = (href: string) => (href === path ? "page" : undefined);

  return (
    <header ref={bar} className={`topbar topbar--${theme}${lifted ? " is-lifted" : ""}${mega ? " has-mega" : ""}${drawer ? " has-drawer" : ""}`}>
      <div className="topbar__pill">
        <Link href="/" className="topbar__brand" translate="no" onClick={toTop}>
          <Image src="/brand/mark.png" alt="" width={22} height={22} priority />
          <span>WebGrow360 .AI</span>
          <span className="topbar__ed">Edition ’26</span>
        </Link>

        <nav className="topbar__nav" aria-label="Main">
          <div className="topbar__menu" onPointerEnter={enter} onPointerLeave={leave}>
            <button ref={megaBtn} type="button" className="topbar__link" aria-expanded={mega} aria-controls="mega-menu" onClick={() => setMega((o) => !o)}>
              <Swap>Services</Swap>
              <svg className="topbar__chev" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="topbar__link" aria-current={current(l.href)}>
              <Swap>{l.label}</Swap>
            </Link>
          ))}
        </nav>

        <div className="topbar__tools">
          <button type="button" className={`toggle${soundOn ? " is-on" : ""}`} aria-pressed={soundOn} onClick={toggleSound} data-sfx="none">
            <span className="toggle__dot" aria-hidden="true" />
            <span className="toggle__label">Sound</span>
          </button>
          <button type="button" className={`toggle${soul ? " is-on" : ""}`} aria-pressed={soul} onClick={toggleSoul} data-sfx="none" title="Art mode: grain, glow and particles">
            <span className="toggle__dot" aria-hidden="true" />
            <span className="toggle__label">Soul</span>
          </button>
          <Link href="/contact" className="topbar__cta" aria-current={current("/contact")}>
            <Swap>Contact</Swap>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3.5 8.5 8.5 3.5M4.5 3.5h4v4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            ref={burger}
            type="button"
            className={`topbar__burger${drawer ? " is-open" : ""}`}
            aria-expanded={drawer}
            aria-controls="nav-drawer"
            aria-label={drawer ? "Close menu" : "Open menu"}
            onClick={() => setDrawer((d) => !d)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Services mega menu */}
      <div id="mega-menu" className={`mega${mega ? " is-open" : ""}`} onPointerEnter={enter} onPointerLeave={leave} hidden={!mega}>
        <ul className="mega__grid">
          {SERVICES.map((s, i) => (
            <li key={s.slug}>
              <Link href={`/services/${s.slug}`} className="mega__item" aria-current={current(`/services/${s.slug}`)} onClick={() => setMega(false)}>
                <span className="mega__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="mega__name">{s.name}</span>
                <span className="mega__fact">{s.fact}</span>
              </Link>
            </li>
          ))}
        </ul>
        <aside className="mega__aside">
          <p className="mega__kicker">Not sure where to start?</p>
          <p className="mega__lede">Tell us about one process that eats your team’s week. We’ll reply within a working day with where AI fits, and where it doesn’t.</p>
          <Link href="/contact" className="mega__go" onClick={() => setMega(false)}>
            Start a conversation <span aria-hidden="true">→</span>
          </Link>
          <a className="mega__alt" href={SITE.booking}>
            or book a 30-minute call
          </a>
        </aside>
      </div>

      {/* Phone and tablet drawer */}
      <div id="nav-drawer" ref={drawerRef} className={`drawer${drawer ? " is-open" : ""}`} hidden={!drawer}>
        <nav aria-label="Main">
          <ul className="drawer__list">
            <li>
              <button type="button" className="drawer__big" aria-expanded={svcOpen} aria-controls="drawer-services" onClick={() => setSvcOpen((o) => !o)}>
                Services <span aria-hidden="true">{svcOpen ? "−" : "+"}</span>
              </button>
              <ul id="drawer-services" className="drawer__sub" hidden={!svcOpen}>
                {SERVICES.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/services/${s.slug}`} onClick={() => setDrawer(false)}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="drawer__big" onClick={() => setDrawer(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/contact" className="drawer__big" onClick={() => setDrawer(false)}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
        <div className="drawer__foot">
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
          <a href={SITE.phoneHref}>{SITE.phone}</a>
          <p>
            <Link href="/privacy" onClick={() => setDrawer(false)}>
              Privacy
            </Link>{" "}
            ·{" "}
            <Link href="/terms" onClick={() => setDrawer(false)}>
              Terms
            </Link>
          </p>
        </div>
      </div>
    </header>
  );
}
