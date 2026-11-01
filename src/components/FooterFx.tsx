"use client";

import { useEffect, useRef, useState } from "react";
import { onScroll, reducedMotion } from "@/lib/scroll";
import { istTime, scramble } from "@/lib/glyph";

const lenis = () => (window as unknown as { __lenis?: { scrollTo: (y: number, o?: object) => void } }).__lenis;

// The footer's small behaviours, wired once to the server-rendered markup: ticking IST clocks, link scrambles,
// phone accordions, back to top, typing credits, and hiding the side rail while the footer has the screen.
export function FooterFx() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const foot = anchor.current?.closest("footer");
    if (!foot) return;
    const still = reducedMotion();
    const offs: (() => void)[] = [];

    // clocks, ticking only while the footer is near the screen
    const clocks = Array.from(foot.querySelectorAll<HTMLElement>("[data-clock]"));
    let clock = 0;
    const tick = () => {
      const t = istTime();
      clocks.forEach((c) => (c.textContent = t));
    };
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearInterval(clock);
        if (e.isIntersecting) {
          tick();
          clock = window.setInterval(tick, 1000);
        }
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(foot);
    offs.push(() => {
      io.disconnect();
      window.clearInterval(clock);
    });

    // the side rail steps aside once the footer fills most of the screen
    offs.push(
      onScroll(() => {
        const on = foot.getBoundingClientRect().top < innerHeight * 0.5;
        document.documentElement.classList.toggle("footer-in", on);
      })
    );
    offs.push(() => document.documentElement.classList.remove("footer-in"));

    // link hover: the first three characters scramble for 150 ms (the underline wipe is CSS)
    if (!still) {
      const over = (e: PointerEvent) => {
        const a = (e.target as Element).closest?.<HTMLElement>(".foot__a");
        if (!a || a.dataset.scr || a.children.length || a.getClientRects().length !== 1) return;
        const final = a.textContent ?? "";
        a.dataset.scr = "1";
        // hold the link's box while the glyphs change so nothing around it moves
        const w = a.getBoundingClientRect().width;
        a.style.cssText = `display:inline-block;width:${w}px;white-space:nowrap`;
        scramble(a, final, 150, { to: 3, keep: " .+@" });
        window.setTimeout(() => {
          a.style.cssText = "";
          delete a.dataset.scr;
        }, 200);
      };
      foot.addEventListener("pointerover", over);
      offs.push(() => foot.removeEventListener("pointerover", over));
    }

    // phone accordions: under 560px each column folds behind its heading
    const cols = Array.from(foot.querySelectorAll<HTMLElement>(".foot__col"));
    const narrow = matchMedia("(max-width: 559px)");
    const setMode = () => {
      cols.forEach((c) => {
        const b = c.querySelector<HTMLButtonElement>(".foot__toggle");
        if (!b) return;
        b.disabled = !narrow.matches;
        const open = !narrow.matches;
        c.classList.toggle("is-open", open);
        b.setAttribute("aria-expanded", String(open));
      });
    };
    setMode();
    narrow.addEventListener("change", setMode);
    const toggle = (e: MouseEvent) => {
      const b = (e.target as Element).closest?.<HTMLButtonElement>(".foot__toggle");
      if (!b || b.disabled) return;
      const c = b.closest(".foot__col");
      const open = !c?.classList.contains("is-open");
      c?.classList.toggle("is-open", open);
      b.setAttribute("aria-expanded", String(open));
    };
    foot.addEventListener("click", toggle);
    offs.push(() => {
      narrow.removeEventListener("change", setMode);
      foot.removeEventListener("click", toggle);
    });

    // back to top
    const top = foot.querySelector<HTMLButtonElement>("[data-totop]");
    const goTop = () => {
      const l = lenis();
      if (l) l.scrollTo(0, still ? { immediate: true } : { duration: 1.8 });
      else scrollTo({ top: 0, behavior: still ? "auto" : "smooth" });
    };
    top?.addEventListener("click", goTop);
    offs.push(() => top?.removeEventListener("click", goTop));

    // credits type out at ~4 ms a character when opened (links stay real links throughout)
    const details = foot.querySelector<HTMLDetailsElement>(".credits");
    const text = details?.querySelector<HTMLElement>("[data-type]");
    let typing = 0;
    const onToggle = () => {
      if (!details?.open || !text || still) return;
      const walker = document.createTreeWalker(text, NodeFilter.SHOW_TEXT);
      const nodes: { n: Text; full: string }[] = [];
      while (walker.nextNode()) nodes.push({ n: walker.currentNode as Text, full: (walker.currentNode as Text).data });
      const total = nodes.reduce((s, x) => s + x.full.length, 0);
      nodes.forEach((x) => (x.n.data = ""));
      const t0 = performance.now();
      const step = (now: number) => {
        let left = Math.floor((now - t0) / 4);
        for (const x of nodes) {
          const k = Math.min(x.full.length, Math.max(0, left));
          x.n.data = x.full.slice(0, k);
          left -= x.full.length;
        }
        if ((now - t0) / 4 < total) typing = requestAnimationFrame(step);
      };
      cancelAnimationFrame(typing);
      typing = requestAnimationFrame(step);
    };
    details?.addEventListener("toggle", onToggle);
    offs.push(() => {
      details?.removeEventListener("toggle", onToggle);
      cancelAnimationFrame(typing);
    });

    return () => offs.forEach((f) => f());
  }, []);

  return <span ref={anchor} hidden />;
}

// "Stay in the loop": a terminal-style email row. There is no mailing-list backend, so a valid address opens the
// visitor's email app with the request addressed to the studio, and the button then decodes into "Sent ✓".
export function FooterForm({ email }: { email: string }) {
  const [value, setValue] = useState("");
  const [focus, setFocus] = useState(false);
  const [sent, setSent] = useState(false);
  const mirror = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const left = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (caret.current && mirror.current) caret.current.style.transform = `translateX(${mirror.current.offsetWidth}px)`;
  }, [value, focus]);

  return (
    <form
      className={`news${focus ? " is-focus" : ""}${sent ? " is-sent" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        const f = e.currentTarget;
        if (!f.reportValidity()) return;
        const subject = encodeURIComponent("Keep me in the loop");
        const body = encodeURIComponent(`Please add ${value} to WebGrow360 .AI updates.`);
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        setSent(true);
        if (left.current && right.current) {
          if (reducedMotion()) {
            left.current.textContent = "Sent";
            right.current.textContent = "✓";
          } else {
            scramble(left.current, "Sent", 360);
            scramble(right.current, "✓", 360);
          }
        }
      }}
    >
      <label className="news__field">
        <span className="sr-only">Your work email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder="you@company.com"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        <span className="news__mirror" ref={mirror} aria-hidden="true">
          {value}
        </span>
        <span className="news__caret" ref={caret} aria-hidden="true">
          ▌
        </span>
      </label>
      <button type="submit" className="split split--sm">
        <span ref={left}>Stay</span>
        <span ref={right}>In the loop</span>
      </button>
    </form>
  );
}
